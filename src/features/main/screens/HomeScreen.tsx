import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  PanResponder,
  Alert
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, Circle, PROVIDER_GOOGLE, Polygon, Polyline } from "react-native-maps";
import { startBackgroundLocationTracking, syncCachedLocationPoints } from "@/services/locationTrackingBackground";
import * as Location from "expo-location";
import * as ExpoBattery from "expo-battery";
import {
  Bell,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  User,
  X,
  Phone,
  Video,
  BellRing,
  MoreHorizontal,
  Battery,
  BatteryCharging,
  Camera,
  UserCheck,
  UserPlus,
  Globe
} from "lucide-react-native";
import * as Linking from "expo-linking";

import { COLORS, styles } from "./HomeScreen.styles";
import { IntimacyDetailsModal } from "./IntimacyDetailsModal";
import { ChallengesModal } from "./ChallengesModal";
import { InventoryModal } from "./InventoryModal";
import { GiftShopModal } from "./GiftShopModal";
import { GlobalGiftAnimation } from "./GlobalGiftAnimation";
import { MomentCameraScreen } from "./MomentCameraScreen";
import { MomentFeedModal } from "./MomentFeedModal";
import { SNAZZY_MAP_STYLE, DARK_MAP_STYLE } from "@/constants/theme";
import { getFriendPopup, getFriendsOnMap } from "@/services/mapApi";
import { getNearbyUsers, searchUsersGlobally } from "@/services/profileApi";
import { momentsApi } from "@/services/momentsApi";
import { socketService } from "@/websockets/socketService";
import { useUser } from "@/store/UserContext";
import { ChatContext } from "@/features/chat/store/ChatContext";
import { apiClient } from "@/services/apiClient";
import { sendFriendRequest, unfriend } from "@/services/friendsApi";

// ── Intimacy Aura Theme Colors ──
const AURA_THEMES: Record<string, { bg: string; bgLight: string; border: string; text: string; accent: string }> = {
  NONE: { bg: '#F8FAFC', bgLight: '#F1F5F9', border: '#CBD5E1', text: '#64748B', accent: '#94A3B8' },
  SILVER: { bg: '#F9FAFB', bgLight: '#F3F4F6', border: '#D1D5DB', text: '#4B5563', accent: '#6B7280' },
  GOLD: { bg: '#FFFBEB', bgLight: '#FEF3C7', border: '#FCD34D', text: '#92400E', accent: '#F59E0B' },
  PLATINUM: { bg: '#ECFEFF', bgLight: '#CFFAFE', border: '#67E8F9', text: '#155E75', accent: '#06B6D4' },
  DIAMOND: { bg: '#F5F3FF', bgLight: '#EDE9FE', border: '#C4B5FD', text: '#5B21B6', accent: '#8B5CF6' },
};
const getAuraTheme = (aura?: string) => AURA_THEMES[aura || 'NONE'] || AURA_THEMES.NONE;

// ── Types ──
interface FriendOnMap {
  userId: string;
  avatarUrl: string;
  latitude: number;
  longitude: number;
  onlineStatus: "ONLINE" | "OFFLINE";
  fullName?: string;
}

interface UnifiedSearchResult {
  id: string; // userId or place_id
  type: 'user' | 'place';
  title: string;
  subtitle: string;
  avatarUrl?: string; // only for 'user'
  location?: { lat: number; lng: number }; // only for 'place'
  isFriend?: boolean; // only for 'user'
  friendshipStatus?: string | null; // 'ACCEPTED' | 'PENDING' | 'REJECTED' | null
  requestId?: string | null;
}

interface FriendPopupData {
  basicInfo: {
    userId: string;
    fullName: string;
    username: string;
    avatarUrl: string;
    onlineStatus: string;
    lastActive: string;
    mutualFriends?: number;
  };
  relationship: {
    status: string;
    requestId: string | null;
    isRequester: boolean;
  };
  location: {
    address: string;
    distance: string;
    latitude: number;
    longitude: number;
    updatedAt: string;
  };
  activity: {
    statusMessage: string;
    activityType: string;
    battery: number | null;
    isCharging: boolean;
    speed: number;
  };
  actions: {
    canChat: boolean;
    canShareLocation: boolean;
    canNavigate: boolean;
    canMute: boolean;
  };
  privacy: {
    canHideMyLocation: boolean;
  };
  optional: {
    storyUrl: string;
    checkInLocation: string;
    rank: {
      level: number;
      name: string;
      iconUrl: string;
      currentExp: number;
      nextLevelExp: number;
      progressPercent: number;
      currentStreak?: number;
      longestStreak?: number;
      aura?: string;
    };
  };
}

const DEFAULT_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

// ── Radar Pulse using native geographical Circles ──
// This completely avoids Android custom view bitmap rendering limitations.
const RING_COUNT = 3;
const RING_CYCLE_MS = 3000;
const RING_STAGGER_MS = 1000;
// Max radius in geographical meters (adjust based on how big you want the pulse)
const MAX_RADIUS_METERS = 200;

const computeGeographicalRing = (elapsed: number) => {
  const progress = Math.min(elapsed / RING_CYCLE_MS, 1);
  const eased = 1 - Math.pow(1 - progress, 3);
  const radius = eased * MAX_RADIUS_METERS; // Expands from 0 to MAX_RADIUS_METERS

  let opacity = 0;
  if (progress < 0.05) opacity = (progress / 0.05) * 0.4;
  else if (progress < 0.4) opacity = 0.4;
  else opacity = 0.4 * (1 - (progress - 0.4) / 0.6);
  opacity = Math.max(0, opacity);

  return { radius, opacity };
};

const RadarPulseCircles = React.memo(({ coordinate }: { coordinate: { latitude: number, longitude: number } }) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // 150ms tick gives approx ~6.6 fps
    const id = setInterval(() => setTick((t) => t + 1), 150);
    return () => clearInterval(id);
  }, []);

  const tickMs = tick * 150;
  const rings = useMemo(() => {
    return Array.from({ length: RING_COUNT }, (_, i) => {
      const offset = i * RING_STAGGER_MS;
      const raw = ((tickMs + RING_CYCLE_MS * 10) - offset) % RING_CYCLE_MS;
      return computeGeographicalRing(raw);
    });
  }, [tickMs]);

  return (
    <>
      {rings.map((ring, i) => (
        <Circle
          key={i}
          center={coordinate}
          radius={ring.radius}
          strokeColor={`rgba(0, 194, 255, ${ring.opacity})`}
          strokeWidth={2}
          fillColor={`rgba(0, 194, 255, ${ring.opacity * 0.15})`}
          zIndex={900}
        />
      ))}
    </>
  );
});

const UserAvatarMarker = React.memo(({ coordinate, userProfile, initials }: { coordinate: any, userProfile: any, initials: string }) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const [imageReady, setImageReady] = useState(false);

  const avatarUrl = userProfile?.avatarUrl
    || `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=6C5CE7&color=fff&size=128`;

  // Prefetch: tải ảnh vào cache trước
  useEffect(() => {
    setTracksViewChanges(true);
    setImageReady(false);
    Image.prefetch(avatarUrl)
      .then(() => setImageReady(true))
      .catch(() => setImageReady(true));
  }, [avatarUrl]);

  if (!imageReady) return null;

  return (
    <Marker
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      zIndex={999}
    >
      <View style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#00C2FF',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: 35,
          height: 35,
          borderRadius: 17.5,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Image
            source={{ uri: avatarUrl }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
            resizeMode="cover"
            fadeDuration={0}
            onLoad={() => {
              setTimeout(() => setTracksViewChanges(false), 300);
            }}
          />
        </View>
      </View>
    </Marker>
  );
});

const FriendAvatarMarker = React.memo(({ friend, onPress }: { friend: FriendOnMap, onPress: (id: string) => void }) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const [imageReady, setImageReady] = useState(false);

  const displayAvatar = friend.avatarUrl || `https://ui-avatars.com/api/?name=F&background=8B5CF6&color=fff&size=128`;

  useEffect(() => {
    setTracksViewChanges(true);
    setImageReady(false);
    Image.prefetch(displayAvatar)
      .then(() => setImageReady(true))
      .catch(() => setImageReady(true));
  }, [displayAvatar]);

  if (!imageReady) return null;

  return (
    <Marker
      coordinate={{ latitude: friend.latitude, longitude: friend.longitude }}
      onPress={() => onPress(friend.userId)}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      zIndex={friend.onlineStatus === 'ONLINE' ? 998 : 997}
    >
      <View style={{
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: friend.onlineStatus === 'OFFLINE' ? '#94A3B8' : '#8B5CF6',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <View style={{
          width: 35,
          height: 35,
          borderRadius: 17.5,
          backgroundColor: '#FFFFFF',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Image
            source={{ uri: displayAvatar }}
            style={{ width: 32, height: 32, borderRadius: 16 }}
            resizeMode="cover"
            fadeDuration={0}
            onLoad={() => {
              setTimeout(() => setTracksViewChanges(false), 300);
            }}
          />
        </View>
      </View>
      {friend.onlineStatus === "ONLINE" && (
        <View style={{
          position: 'absolute',
          bottom: -2,
          right: -2,
          width: 14,
          height: 14,
          borderRadius: 7,
          backgroundColor: COLORS.online,
          borderWidth: 2,
          borderColor: '#FFFFFF',
        }} />
      )}
    </Marker>
  );
});

// ── High Five Animation Marker ──
const HighFiveMarker = React.memo(({ data }: { data: any }) => {
  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animVal, {
      toValue: 1,
      duration: 15000,
      useNativeDriver: true,
      easing: Easing.out(Easing.exp)
    }).start();
  }, []);

  const leftHandTranslateX = animVal.interpolate({ inputRange: [0, 0.07, 0.1, 1], outputRange: [-60, 0, 0, -10] });
  const rightHandTranslateX = animVal.interpolate({ inputRange: [0, 0.07, 0.1, 1], outputRange: [60, 0, 0, 10] });
  const opacity = animVal.interpolate({ inputRange: [0, 0.03, 0.5, 1], outputRange: [0, 1, 1, 0] });
  const scale = animVal.interpolate({ inputRange: [0, 0.05, 0.07, 1], outputRange: [0.5, 1, 1.4, 1] });

  return (
    <Marker coordinate={{ latitude: data.lat, longitude: data.lng }} anchor={{ x: 0.5, y: 0.5 }} zIndex={9999} tracksViewChanges={false}>
      <Animated.View style={{ width: 150, height: 150, justifyContent: 'center', alignItems: 'center', opacity }}>
        <Animated.Text style={{ position: 'absolute', fontSize: 50, transform: [{ scale }], textShadowColor: '#FFA114', textShadowRadius: 10 }}>💥</Animated.Text>
        <Animated.Text style={{ position: 'absolute', fontSize: 45, transform: [{ translateX: leftHandTranslateX }] }}>✋</Animated.Text>
        <Animated.Text style={{ position: 'absolute', fontSize: 45, transform: [{ translateX: rightHandTranslateX }, { scaleX: -1 }] }}>✋</Animated.Text>
      </Animated.View>
    </Marker>
  );
});

// ── Moment Cluster Marker (for map) ──
interface ClusterData {
  latitude: number;
  longitude: number;
  momentCount: number;
  avatars: { userId: string; avatarUrl: string; fullName: string }[];
  hasMore: boolean;
  momentIds: string[];
  latestImageUrl: string;
  imageUrls: string[];
}

const MomentClusterMarker = React.memo(({ cluster, onPress }: { cluster: ClusterData; onPress: () => void }) => {
  const [tracksViewChanges, setTracksViewChanges] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Stop tracking after 1 second as a fallback, or when the main image loads
  useEffect(() => {
    const timer = setTimeout(() => {
      setTracksViewChanges(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (cluster.imageUrls && cluster.imageUrls.length > 1) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % cluster.imageUrls.length);
        setTracksViewChanges(true); 
        setTimeout(() => setTracksViewChanges(false), 300);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [cluster.imageUrls]);

  const displayImageUrl = cluster.imageUrls && cluster.imageUrls.length > 0 
    ? cluster.imageUrls[currentImageIndex] 
    : cluster.latestImageUrl;

  return (
    <Marker
      coordinate={{ latitude: cluster.latitude, longitude: cluster.longitude }}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      tracksViewChanges={tracksViewChanges}
      zIndex={800}
    >
      {/* Explicit bounding box to guarantee all elements sit within positive (>= 0) coordinates to prevent map clipping */}
      <View style={{ minWidth: 52, height: 44 }}>
        {/* Main thumbnail container offset to the bottom-right of the bounding box */}
        <View style={{
          width: 32,
          height: 32,
          marginTop: 6,
          marginLeft: 6,
          borderRadius: 12,
          backgroundColor: '#1E1B4B',
          borderWidth: 2.5,
          borderColor: '#8B5CF6',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden',
        }}>
          {/* Thumbnail Image */}
          <Image
            source={{ uri: displayImageUrl }}
            style={{ width: '100%', height: '100%' }}
            resizeMode="cover"
            fadeDuration={0}
            onLoad={() => setTimeout(() => setTracksViewChanges(false), 300)}
          />
        </View>

        {/* Avatars stack positioned at true (0,0) of the bounding box */}
        {cluster.avatars && cluster.avatars.length > 0 && (
          <View style={{
            position: 'absolute',
            top: 0,
            left: 0,
            flexDirection: 'row',
            zIndex: 10,
          }}>
            {cluster.avatars.map((avatar, i) => (
              <View key={avatar.userId} style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                borderWidth: 1.5,
                borderColor: '#fff',
                overflow: 'hidden',
                marginLeft: i > 0 ? -6 : 0,
                backgroundColor: '#1E1B4B',
                zIndex: 5 - i,
              }}>
                <Image
                  source={{ uri: avatar.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(avatar.fullName?.charAt(0) || 'U')}&background=8B5CF6&color=fff&size=64` }}
                  style={{ width: '100%', height: '100%' }}
                  resizeMode="cover"
                  fadeDuration={0}
                />
              </View>
            ))}
            {cluster.hasMore && (
              <View style={{
                width: 16,
                height: 16,
                borderRadius: 8,
                backgroundColor: '#4C1D95',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: -6,
                borderWidth: 1.5,
                borderColor: '#fff',
                zIndex: 1,
              }}>
                <Text style={{ color: '#fff', fontSize: 6, fontWeight: 'bold' }}>...</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </Marker>
  );
});

export const HomeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { userProfile } = useUser();
  const { totalUnreadCount, fetchConversationsAndUnreadCount } = React.useContext(ChatContext);
  const searchInputRef = useRef<TextInput>(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // ── State ──
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [friends, setFriends] = useState<FriendOnMap[]>([]);
  const [hasAutoFitted, setHasAutoFitted] = useState(false);

  const [selectedFriend, setSelectedFriend] = useState<FriendPopupData | null>(null);
  const [region, setRegion] = useState(DEFAULT_REGION);

  // ── Search & Animation State ──
  const [isSearching, setIsSearching] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;

  // ── Unified Search State ──
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UnifiedSearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  // Determine if it's nighttime for dark map styling (6 PM to 6 AM)
  const isNightTime = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 6 || hour >= 18;
  }, []);

  // ── Nearby Users (all users, not just friends) ──
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // ── Notification badge ──
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // ── Intimacy Modal ──
  const [showIntimacyModal, setShowIntimacyModal] = useState(false);

  // ── Challenges & Gift Modals ──
  const [showChallengesModal, setShowChallengesModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showGiftModal, setShowGiftModal] = useState(false);

  // ── Proximity Meetup State ──
  const [pingEvent, setPingEvent] = useState<{ user1: string, user2: string, user1Name?: string, user2Name?: string, lat: number, lng: number } | null>(null);
  const [highFives, setHighFives] = useState<{ id: string, user1: string, user2: string, lat: number, lng: number }[]>([]);

  // ── Moment State ──
  const [showMomentCamera, setShowMomentCamera] = useState(false);
  const [showMomentFeed, setShowMomentFeed] = useState(false);
  const [momentFeedMode, setMomentFeedMode] = useState<"global" | "local">("global");

  // Handle URL params for navigating from Notifications
  useEffect(() => {
    if (params.showMomentFeed === "true") {
      setMomentFeedMode("global");
      setShowMomentFeed(true);
      // Clean up param by replacing route without it to avoid re-triggering (optional but good practice)
      router.setParams({ showMomentFeed: undefined, targetMomentId: undefined });
    }
  }, [params.showMomentFeed]);

  const [momentClusters, setMomentClusters] = useState<ClusterData[]>([]);
  const [selectedClusterCoord, setSelectedClusterCoord] = useState<{ latitude: number; longitude: number } | null>(null);

  // ── Map Exploration (Fog of War) State ──
  const [exploredBoundaries, setExploredBoundaries] = useState<{ id: string; coords: { latitude: number; longitude: number }[] }[]>([]);
  const [todaysRoute, setTodaysRoute] = useState<{lat: number, lng: number}[]>([]);
  const [explorationProgress, setExplorationProgress] = useState<string>("0");

  const initExploration = useCallback(async () => {
    try {
      await startBackgroundLocationTracking();
      await syncCachedLocationPoints();
      fetchExplorationMap();
    } catch (e) {
      console.log("Failed to init tracking", e);
    }
  }, []);

  const fetchExplorationMap = useCallback(async () => {
    try {
      const res: any = await apiClient.get('/exploration/my-map');
      if (res && res.data) {
        setExploredBoundaries(res.data.boundaries || []);
        setTodaysRoute(res.data.todaysPath || []);
        setExplorationProgress(res.data.progressPercent || "0");
      }
    } catch (e) {
      console.log("Failed to fetch exploration data", e);
    }
  }, []);

  useEffect(() => {
    initExploration();
  }, []);

  // ── Animations ──
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const popupSlide = useRef(new Animated.Value(300)).current;

  const initials = userProfile?.firstName
    ? userProfile.firstName.charAt(0).toUpperCase()
    : "?";

  // ── Battery tracking ──
  const batteryRef = useRef<{ level: number, isCharging: boolean }>({ level: 100, isCharging: false });

  useEffect(() => {
    let isMounted = true;
    const initBattery = async () => {
      try {
        const level = await ExpoBattery.getBatteryLevelAsync();
        const state = await ExpoBattery.getBatteryStateAsync();
        if (isMounted && level !== -1) {
          batteryRef.current = {
            level: Math.round(level * 100),
            isCharging: state === ExpoBattery.BatteryState.CHARGING || state === ExpoBattery.BatteryState.FULL,
          };
        }
      } catch (e) {
        console.log("[Battery] Error getting initial battery", e);
      }
    };
    initBattery();

    let subLevel: any;
    let subState: any;
    try {
      subLevel = ExpoBattery.addBatteryLevelListener(({ batteryLevel }) => {
        batteryRef.current.level = Math.round(batteryLevel * 100);
      });
      subState = ExpoBattery.addBatteryStateListener(({ batteryState }) => {
        batteryRef.current.isCharging = batteryState === ExpoBattery.BatteryState.CHARGING || batteryState === ExpoBattery.BatteryState.FULL;
      });
    } catch (e) {
      console.log("[Battery] Listeners not available", e);
    }

    return () => {
      isMounted = false;
      if (subLevel?.remove) subLevel.remove();
      if (subState?.remove) subState.remove();
    };
  }, []);

  // ── Pulse animation for chat button ──
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.06,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  // ── Fetch unread notification count ──
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res: any = await apiClient.get("/notifications");
      const list = Array.isArray(res) ? res : (res?.data || []);
      const unread = list.filter((n: any) => !n.isRead).length;
      setUnreadNotifCount(unread);
    } catch (e) { /* ignore */ }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchUnreadCount();
    }, [fetchUnreadCount])
  );

  useEffect(() => {
    const handleNewNotif = () => {
      setUnreadNotifCount((prev) => prev + 1);
    };
    socketService.on("new_notification", handleNewNotif);
    socketService.on("new_map_event", handleNewNotif);
    return () => {
      socketService.off("new_notification", handleNewNotif);
      socketService.off("new_map_event", handleNewNotif);
    };
  }, []);

  // ── Unified Search Logic (Debounced) ──
  useEffect(() => {
    if (!isSearching) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }

    if (searchQuery.trim().length === 0) {
      // If empty query, simply display nearby users as defaults
      setSearchResults(nearbyUsers.map((u: any) => {
        const isFriend = u.isFriend === true;
        return {
          id: u.userId,
          type: 'user',
          title: u.fullName || 'Người dùng',
          subtitle: `Cách đây ${u.distance} • ${isFriend ? 'Bạn bè' : 'Chưa kết bạn'}`,
          avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName?.charAt(0) || 'U')}&background=8B5CF6&color=fff&size=128`,
          isFriend
        };
      }));
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchLoading(true);
      try {
        const query = searchQuery.toLowerCase();
        
        // 1. Fetch Global Users from Backend Search (includes isFriend & friendshipStatus)
        let userResults: UnifiedSearchResult[] = [];
        try {
          const userRes: any = await searchUsersGlobally(query);
          if (userRes?.success && userRes?.data) {
            userResults = userRes.data.map((u: any) => {
              const isFriend = u.isFriend === true;
              const status = u.friendshipStatus; // 'ACCEPTED' | 'PENDING' | null
              
              let subtitle = 'Chưa kết bạn';
              if (isFriend) subtitle = 'Bạn bè';
              else if (status === 'PENDING') subtitle = 'Đã gửi lời mời';

              return {
                 id: u.userId,
                 type: 'user',
                 title: u.fullName || 'Người dùng',
                 subtitle,
                 avatarUrl: u.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.fullName?.charAt(0) || 'U')}&background=8B5CF6&color=fff&size=128`,
                 isFriend,
                 friendshipStatus: status,
                 requestId: u.requestId,
              };
            });
          }
        } catch (error) {
           console.log("[GlobalSearch] error fetching users:", error);
        }

        // 2. Query OSM Nominatim Autocomplete API (Free, No Key Required, bypasses Google Android key limits)
        const nomBaseUrl = "https://nominatim.openstreetmap.org/search";
        const res = await fetch(`${nomBaseUrl}?q=${encodeURIComponent(searchQuery)}&format=json&addressdetails=1&limit=5&countrycodes=vn`, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'PingMe React Native App'
          }
        });
        const nominatimData = await res.json();
        
        let placeResults: UnifiedSearchResult[] = [];
        if (Array.isArray(nominatimData)) {
          placeResults = nominatimData.map((p: any) => {
            const parts = (p.display_name || '').split(',');
            return {
              id: p.place_id ? p.place_id.toString() : p.lat + p.lon,
              type: 'place',
              title: parts[0]?.trim() || p.name || 'Địa điểm',
              subtitle: parts.slice(1).join(',')?.trim() || p.display_name,
              location: { lat: parseFloat(p.lat), lng: parseFloat(p.lon) }
            };
          });
        }

        setSearchResults([...userResults, ...placeResults]);
      } catch (error) {
        console.log("[UnifiedSearch] error:", error);
      } finally {
        setIsSearchLoading(false);
      }
    }, 400); // 400ms typing debounce

    return () => clearTimeout(timer);
  }, [searchQuery, isSearching, nearbyUsers]);

  const handleSearchSelect = async (item: UnifiedSearchResult) => {
    if (item.type === 'user') {
      handleFriendPress(item.id);
    } else if (item.type === 'place' && item.location) {
      // Nominatim payload already includes lat/lng natively
      setIsSearchLoading(true);
      try {
        mapRef.current?.animateToRegion({
          latitude: item.location.lat,
          longitude: item.location.lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 1000);
        toggleSearch(false);
      } catch (error) {
        console.log("[PlaceDetails] error:", error);
      } finally {
        setIsSearchLoading(false);
      }
    }
  };

  // ── Proximity Ping PanResponder ──
  const pingPanY = useRef(new Animated.Value(0)).current;
  const pingEventRef = useRef(pingEvent);
  useEffect(() => { pingEventRef.current = pingEvent; }, [pingEvent]);

  const triggerHighFive = useCallback((u1: string, u2: string, lat: number, lng: number) => {
    const id = `${u1}_${u2}_${Date.now()}`;
    setHighFives(prev => [...prev, { id, user1: u1, user2: u2, lat, lng }]);
    setTimeout(() => {
      setHighFives(prev => prev.filter(hf => hf.id !== id));
    }, 15000);
  }, []);

  const pingPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: Animated.event([null, { dy: pingPanY }], { useNativeDriver: false }),
      onPanResponderRelease: (e, gestureState) => {
        if (gestureState.dy > 80) { // Swiped down
          Animated.timing(pingPanY, {
            toValue: 500,
            duration: 200,
            useNativeDriver: true
          }).start(() => {
            const evt = pingEventRef.current;
            pingPanY.setValue(0);
            setPingEvent(null);
            if (evt) triggerHighFive(evt.user1, evt.user2, evt.lat, evt.lng);
          });
        } else {
          Animated.spring(pingPanY, {
            toValue: 0,
            useNativeDriver: true
          }).start();
        }
      }
    })
  ).current;

  // ── Init Location ──
  useEffect(() => {
    let locationWatcher: Location.LocationSubscription | null = null;
    let isMounted = true;

    const init = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          console.log("[Map] Location permission denied");
          setIsLoading(false);
          return;
        }

        // Step 1: Try getLastKnownPositionAsync first (fastest)
        let initialLoc = await Location.getLastKnownPositionAsync({
          maxAge: 300000, // 5 minutes — very wide window for emulator
        });

        if (initialLoc) {
          console.log("[Map] Got last known position");
          const coords = {
            latitude: initialLoc.coords.latitude,
            longitude: initialLoc.coords.longitude,
          };
          setUserLocation(coords);
          const newRegion = { ...coords, latitudeDelta: 0.035, longitudeDelta: 0.035 };
          setRegion(newRegion);

          let speedVal = 0;
          if (initialLoc.coords.speed && initialLoc.coords.speed > 0) {
            speedVal = Math.round(initialLoc.coords.speed * 3.6);
          }

          socketService.emit("update_location", {
            lat: coords.latitude,
            lng: coords.longitude,
            speed: speedVal,
            battery: batteryRef.current.level,
            isCharging: batteryRef.current.isCharging
          });
        }

        // Step 2: Start watchPositionAsync
        let gotFirstLocation = !!initialLoc;

        const watchPromise = new Promise<void>(async (resolve) => {
          try {
            locationWatcher = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.High,
                timeInterval: 5000,
                distanceInterval: 0, // Trigger even if standing still (critical for static emulators)
              },
              (newLoc) => {
                if (!isMounted) return;
                const newCoords = {
                  latitude: newLoc.coords.latitude,
                  longitude: newLoc.coords.longitude,
                };

                if (!gotFirstLocation) {
                  console.log("[Map] ✅ Got location from watcher:", newCoords.latitude, newCoords.longitude);
                  gotFirstLocation = true;
                  const newRegion = { ...newCoords, latitudeDelta: 0.035, longitudeDelta: 0.035 };
                  setRegion(newRegion);
                }

                setUserLocation(newCoords);

                // ── FOREGROUND DIRECT SYNC ──
                // Even if Background permissions are denied, foreground movement will be synced directly!
                const syncPoint = { lat: newCoords.latitude, lng: newCoords.longitude };
                apiClient.post('/exploration/sync', { points: [syncPoint] })
                  .then(() => fetchExplorationMap())
                  .catch(e => console.log("[Map] Foreground sync failed", e));

                let speedVal = 0;
                if (newLoc.coords.speed && newLoc.coords.speed > 0) {
                  speedVal = Math.round(newLoc.coords.speed * 3.6);
                }

                socketService.emit("update_location", {
                  lat: newCoords.latitude,
                  lng: newCoords.longitude,
                  speed: speedVal,
                  battery: batteryRef.current.level,
                  isCharging: batteryRef.current.isCharging
                });

                resolve(); // Resolve once we get the first location
              }
            );
            console.log("[Map] Location watcher started successfully");
          } catch (watchError) {
            console.log("[Map] Error starting location watcher:", watchError);
            resolve();
          }
        });

        // Step 3: Wait up to 20s for the first location from the watcher
        if (!initialLoc) {
          const timeoutPromise = new Promise<void>((resolve) =>
            setTimeout(() => {
              if (!gotFirstLocation) {
                console.log("[Map] Watcher timeout — using default location");
                setUserLocation({
                  latitude: DEFAULT_REGION.latitude,
                  longitude: DEFAULT_REGION.longitude,
                });
              }
              resolve();
            }, 20000)
          );

          await Promise.race([watchPromise, timeoutPromise]);
        }

        await fetchFriends();
      } catch (error) {
        console.log("[Map] Init error:", error);
      } finally {
        setIsLoading(false);
        console.log("[Map] Init complete. userLocation will render on next frame.");
      }
    };

    init();
    return () => {
      isMounted = false;
      locationWatcher?.remove();
    };
  }, []);

  // ── Listen WebSockets ──
  useEffect(() => {
    const handleFriendLocationUpdate = (data: { userId: string; fullName?: string; lat: number; lng: number; avatarUrl?: string }) => {
      setFriends((prev) => {
        const friendExists = prev.some((f) => f.userId === data.userId);
        if (friendExists) {
          return prev.map((f) =>
            f.userId === data.userId ? { ...f, fullName: f.fullName || data.fullName, latitude: data.lat, longitude: data.lng, onlineStatus: "ONLINE" } : f
          );
        } else {
          // Add the newly online friend to the map
          return [
            ...prev,
            {
              userId: data.userId,
              fullName: data.fullName,
              avatarUrl: data.avatarUrl || "https://ui-avatars.com/api/?name=F&background=8B5CF6&color=fff&size=128",
              latitude: data.lat,
              longitude: data.lng,
              onlineStatus: "ONLINE",
            },
          ];
        }
      });
    };
    const handleUserOnline = (data: { userId: string }) => {
      setFriends((prev) =>
        prev.map((f) => f.userId === data.userId ? { ...f, onlineStatus: "ONLINE" } : f)
      );
    };
    const handleUserOffline = (data: { userId: string }) => {
      // Remove offline friend from map immediately
      setFriends((prev) => prev.filter((f) => f.userId !== data.userId));
    };

    const handleReceiveNudge = (data: any) => {
      // In a real app, you might show a Custom Toast or trigger vibration
      console.log("[Map] Received nudge from:", data?.senderName);
      alert(`👋 ${data?.senderName || 'Một người bạn'} vừa chọc bạn!`);
    };

    const handleRequestLocationUpdate = (data: any) => {
      console.log("[Map] Someone requested a location update. Pushing new location...");
      if (userLocation) {
        socketService.emit("update_location", {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          speed: 0,
          battery: batteryRef.current.level,
          isCharging: batteryRef.current.isCharging
        });
      }
    };

    const handlePingSuccess = () => alert("Đã gửi Nudge thành công!");
    const handleReqLocationSuccess = () => alert("Đã gửi yêu cầu cập nhật vị trí!");

    const handleProximityMeetup = (data: { user1: string, user2: string, lat: number, lng: number }) => {
      setPingEvent(data);
      // Auto dismiss after 4s
      setTimeout(() => {
        if (pingEventRef.current) {
          const evt = pingEventRef.current;
          setPingEvent(null);
          triggerHighFive(evt.user1, evt.user2, evt.lat, evt.lng);
        }
      }, 4000);
    };

    const handleProximityBroadcast = (data: { user1: string, user2: string, lat: number, lng: number }) => {
      triggerHighFive(data.user1, data.user2, data.lat, data.lng);
    };

    socketService.on("friend_location_update", handleFriendLocationUpdate);
    socketService.on("user_online", handleUserOnline);
    socketService.on("user_offline", handleUserOffline);
    socketService.on("receive_nudge", handleReceiveNudge);
    socketService.on("request_location_update", handleRequestLocationUpdate);
    socketService.on("ping_sent_success", handlePingSuccess);
    socketService.on("req_location_sent_success", handleReqLocationSuccess);
    socketService.on("proximity_meetup", handleProximityMeetup);
    socketService.on("proximity_broadcast", handleProximityBroadcast);

    return () => {
      socketService.off("friend_location_update", handleFriendLocationUpdate);
      socketService.off("user_online", handleUserOnline);
      socketService.off("user_offline", handleUserOffline);
      socketService.off("receive_nudge", handleReceiveNudge);
      socketService.off("request_location_update", handleRequestLocationUpdate);
      socketService.off("ping_sent_success", handlePingSuccess);
      socketService.off("req_location_sent_success", handleReqLocationSuccess);
      socketService.off("proximity_meetup", handleProximityMeetup);
      socketService.off("proximity_broadcast", handleProximityBroadcast);
    };
  }, []);

  // ── Fetch Friends ──
  const fetchFriends = async () => {
    try {
      const response: any = await getFriendsOnMap();
      if (response.success && response.data) {
        setFriends(response.data);
      }
    } catch (error) {
      console.log("[Map] Fetch friends error:", error);
    }
  };

  // ── Fetch Moment Clusters ──
  const fetchMomentClusters = useCallback(async () => {
    try {
      const response: any = await momentsApi.getMapClusters();
      if (response?.success && response?.data) {
        setMomentClusters(response.data);
      }
    } catch (error) {
      console.log("[Map] Fetch moment clusters error:", error);
    }
  }, []);

  // ── Initial fetch moment clusters ──
  useEffect(() => {
    fetchMomentClusters();
  }, []);

  // ── WebSocket Moment listeners ──
  useEffect(() => {
    const handleNewMoment = () => {
      fetchMomentClusters();
    };
    const handleMomentDeleted = () => {
      fetchMomentClusters();
    };
    socketService.on("new_moment", handleNewMoment);
    socketService.on("moment_deleted", handleMomentDeleted);
    return () => {
      socketService.off("new_moment", handleNewMoment);
      socketService.off("moment_deleted", handleMomentDeleted);
    };
  }, []);

  // ── Map Reload Interval ──
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchFriends();
      fetchMomentClusters();
      fetchExplorationMap();
    }, 10000); // Reload friends map and moment clusters every 10 seconds

    return () => clearInterval(intervalId);
  }, []);

  // ── Fetch Nearby Users (tất cả user gần đây, không chỉ bạn bè) ──
  const fetchNearbyUsers = useCallback(async () => {
    if (!userLocation) {
      console.log("[Map] fetchNearbyUsers: No user location yet");
      return;
    }
    try {
      setIsLoadingNearby(true);
      console.log("[Map] Fetching nearby users at:", userLocation.latitude, userLocation.longitude);
      const response: any = await getNearbyUsers(
        userLocation.latitude,
        userLocation.longitude,
        5000 // bán kính 5km
      );
      console.log("[Map] Nearby users response:", JSON.stringify(response));
      if (response.success && response.data) {
        setNearbyUsers(response.data);
      }
    } catch (error) {
      console.log("[Map] Fetch nearby users error:", error);
    } finally {
      setIsLoadingNearby(false);
    }
  }, [userLocation]);

  // ── Search Toggle Logic ──
  const toggleSearch = (open: boolean) => {
    if (open) {
      setIsSearching(true);
      fetchNearbyUsers();
    }
    Animated.timing(searchAnim, {
      toValue: open ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      if (!open) setIsSearching(false);
      else searchInputRef.current?.focus();
    });
    if (!open) {
      searchInputRef.current?.blur();
      setSearchQuery("");
      setSearchResults([]);
    }
  };

  // ── Search Animated Styles ──
  const searchTop = insets.top > 0 ? insets.top : 10; // Đẩy lên sát mép màn hình (kể cả vùng tai thỏ)

  const searchHeight = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 48]
  });

  const searchWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [100, screenWidth - 32] // Collapsed: 100px width pill. Expanded: Full width minus 32px margins.
  });
  
  const searchLeft = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [(screenWidth / 2) - 50, 16] // Collapsed: center. Expanded: left 16.
  });

  const searchBorderRadius = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 24]
  });

  const searchIconOpacity = searchAnim.interpolate({
    inputRange: [0, 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });

  const searchContentOpacity = searchAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });

  const searchBackdropOpacity = searchAnim;
  const listTop = insets.top + 70;

  // ── Handle friend popup ──
  const handleFriendPress = useCallback(async (friendId: string) => {
    try {
      const response: any = await getFriendPopup(friendId);
      if (response.success && response.data) {
        setSelectedFriend(response.data);
        popupSlide.setValue(300);
        Animated.spring(popupSlide, {
          toValue: 0,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }
    } catch (error) {
      console.log("[Map] Friend popup error:", error);
    }
  }, []);

  const closePopup = useCallback(() => {
    Animated.timing(popupSlide, {
      toValue: 300,
      duration: 200,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }).start(() => setSelectedFriend(null));
  }, []);

  const handleStartChat = async (friendId: string) => {
    try {
      const res: any = await apiClient.post("/conversations", {
        participantIds: [friendId],
        type: "ONE_TO_ONE",
      });
      if (res && res.data && res.data.id) {
        router.push(`/(main)/chat/${res.data.id}`);
      } else {
        alert("Không thể mở trò chuyện");
      }
    } catch (error) {
      console.log("[Map] Start chat error:", error);
      alert("Lỗi khi mở trò chuyện");
    }
  };

  const fitAllFriends = useCallback(() => {
    if (!mapRef.current) return;
    
    if (friends.length === 0) {
      if (userLocation) {
        mapRef.current.animateToRegion(
          { ...userLocation, latitudeDelta: 0.035, longitudeDelta: 0.035 },
          800
        );
      }
      return;
    }

    const coords = [
      ...(userLocation ? [{ latitude: userLocation.latitude, longitude: userLocation.longitude }] : []),
      ...friends.map(f => ({ latitude: f.latitude, longitude: f.longitude }))
    ];

    if (coords.length > 0) {
      mapRef.current.fitToCoordinates(coords, {
        edgePadding: { top: 100, right: 60, bottom: 200, left: 60 },
        animated: true,
      });
    }
  }, [userLocation, friends]);

  useEffect(() => {
    if (friends.length > 0 && mapRef.current && !hasAutoFitted) {
      setTimeout(() => fitAllFriends(), 1500); // Small delay to ensure MapView is fully loaded
      setHasAutoFitted(true);
    }
  }, [friends, hasAutoFitted, fitAllFriends]);

  const centerOnMe = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        { ...userLocation, latitudeDelta: 0.035, longitudeDelta: 0.035 },
        800
      );
    }
  }, [userLocation]);

  if (isLoading) {
    return (
      <View style={styles.loadingOverlay}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải bản đồ...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ── MAP ── */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        customMapStyle={isNightTime ? DARK_MAP_STYLE : SNAZZY_MAP_STYLE}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
        toolbarEnabled={false}
        moveOnMarkerPress={false}
        pitchEnabled={false}
        loadingEnabled={false}
      >
        {/* ── My location with animated radar pulse ── */}
        {userLocation ? (
          <>
            {/* The Radar as Geographical Map Circles */}
            <RadarPulseCircles coordinate={userLocation} />
            <UserAvatarMarker coordinate={userLocation} userProfile={userProfile} initials={initials} />
          </>
        ) : null}

        {friends.map((friend) => (
          <FriendAvatarMarker
            key={friend.userId}
            friend={friend}
            onPress={handleFriendPress}
          />
        ))}

        {highFives.map((hf) => (
          <HighFiveMarker key={hf.id} data={hf} />
        ))}

        {/* ── Moment Cluster Markers ── */}
        {momentClusters.map((cluster, idx) => (
          <MomentClusterMarker
            key={`mc_${idx}_${cluster.latitude}_${cluster.longitude}`}
            cluster={cluster}
            onPress={() => {
              setSelectedClusterCoord({ latitude: cluster.latitude, longitude: cluster.longitude });
              setMomentFeedMode("local");
              setShowMomentFeed(true);
            }}
          />
        ))}

        {/* ── Exploration Polygons (Fog of War) ── */}
        {exploredBoundaries.map((boundary) => (
          <Polygon
            key={`explore-${boundary.id}`}
            coordinates={boundary.coords}
            fillColor="rgba(0, 255, 204, 0.25)"
            strokeColor="rgba(0, 255, 204, 0.8)"
            strokeWidth={1}
            zIndex={100}
          />
        ))}

        {/* ── Exploration Route Polyline ── */}
        {todaysRoute?.filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat)).length > 0 && (
          <Polyline
            coordinates={todaysRoute
               .filter(p => p && typeof p.lat === 'number' && typeof p.lng === 'number' && !isNaN(p.lat))
               .map(p => ({ latitude: p.lat, longitude: p.lng }))
            }
            strokeColor="#8B5CF6"
            strokeWidth={4}
            lineDashPattern={[1]}
            zIndex={105}
          />
        )}
      </MapView>

      {/* ── Exploration Progress Bar (UI Overlay) ── */}
      <View style={{
        position: 'absolute',
        top: insets.top > 0 ? insets.top + 70 : 80,
        left: 16,
        backgroundColor: 'transparent',
        paddingVertical: 6,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 5
      }}>
        <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: 'bold', textShadowColor: 'rgba(0, 0, 0, 0.75)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 3 }}>📍 {explorationProgress}%</Text>
      </View>

      {/* ── SEARCH ANIMATED OVERLAY ── */}
      <Animated.View
        style={[
          styles.searchOverlayBackground,
          { opacity: searchBackdropOpacity, pointerEvents: isSearching ? "auto" : "none" }
        ]}
      >
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => toggleSearch(false)} />
      </Animated.View>

      <Animated.View
        style={[
          styles.heroSearchContainer,
          { 
             top: searchTop, 
             left: searchLeft, 
             width: searchWidth, 
             height: searchHeight, 
             borderRadius: searchBorderRadius, 
             backgroundColor: COLORS.bgGlass,
             borderWidth: 0,
             shadowColor: "rgba(0,0,0,0.1)",
             shadowOpacity: 1, 
             shadowRadius: 15, 
             elevation: 8 
          }
        ]}
      >
        {/* Unexpanded Icon State */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: searchIconOpacity, justifyContent: 'center', alignItems: 'center' }]} pointerEvents={isSearching ? "none" : "auto"}>
          <TouchableOpacity
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => toggleSearch(true)}
            disabled={isSearching}
          >
            <Search size={22} color={COLORS.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>

        {/* Expanded Search Input State */}
        <Animated.View style={[{ opacity: searchContentOpacity }, styles.heroSearchExpanded]} pointerEvents={isSearching ? "auto" : "none"}>
          <Search size={18} color={COLORS.textSecondary} />
          <TextInput
            ref={searchInputRef}
            style={styles.heroSearchInput}
            placeholder="Tìm kiếm người dùng, địa điểm..."
            placeholderTextColor={COLORS.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => toggleSearch(true)}
            onBlur={() => { if (!searchQuery && !isSearching) toggleSearch(false); }}
          />
          {isSearching && (
            <TouchableOpacity onPress={() => toggleSearch(false)} style={{ padding: 4 }}>
              <X size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </Animated.View>
      </Animated.View>

      {/* Nearby Users List below expanding search */}
      {isSearching && (
        <Animated.View style={[
          styles.nearbyListContainer,
          {
            opacity: searchContentOpacity,
            top: listTop,
            left: searchLeft,
            width: searchWidth
          }
        ]}>
          {isSearchLoading ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ paddingVertical: 16 }} />
          ) : searchResults.length === 0 ? (
            <Text style={styles.emptyNearby}>Không tìm thấy kết quả nào.</Text>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.nearbyItem} onPress={() => handleSearchSelect(item)}>
                  {item.type === 'user' ? (
                    <Image
                      source={{ uri: item.avatarUrl }}
                      style={styles.nearbyAvatar}
                    />
                  ) : (
                    <View style={[styles.nearbyAvatar, { backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center' }]}>
                       <MapPin size={20} color={COLORS.primary} />
                    </View>
                  )}
                  
                  <View style={styles.nearbyInfo}>
                    <Text style={styles.nearbyName}>{item.title}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                       {item.type === 'user' && (
                         item.isFriend ? (
                           <UserCheck size={14} color={COLORS.primary} style={{ marginRight: 4 }} />
                         ) : (
                           <UserPlus size={14} color={COLORS.textMuted} style={{ marginRight: 4 }} />
                         )
                       )}
                       <Text style={[styles.nearbyDistance, { color: item.type === 'user' && !item.isFriend ? COLORS.textMuted : COLORS.textSecondary }]} numberOfLines={1}>
                         {item.subtitle}
                       </Text>
                    </View>
                  </View>
                  {item.type === 'user' ? (
                    <TouchableOpacity 
                      style={styles.nearbyChatBtn}
                      onPress={() => {
                        if (item.isFriend) {
                          handleStartChat(item.id);
                        } else {
                           Alert.alert(
                            "Kết bạn",
                            `Bạn có chắc chắn muốn gửi lời mời kết bạn đến ${item.title}?`,
                            [
                              { text: "Từ chối", style: "cancel" },
                              { text: "Đồng ý", onPress: async () => {
                                  try {
                                    const res: any = await sendFriendRequest(item.id);
                                    if (res.success) {
                                      Alert.alert("Thành công", "Đã gửi lời mời kết bạn.");
                                    } else {
                                      Alert.alert("Lỗi", res.message || "Không thể gửi lời mời kết bạn.");
                                    }
                                  } catch (e: any) {
                                     Alert.alert("Lỗi", e?.message || "Đã xảy ra lỗi");
                                  }
                              }}
                            ]
                          );
                        }
                      }}
                    >
                      {item.isFriend ? <MessageCircle size={18} color={COLORS.primary} strokeWidth={2} /> : <UserPlus size={18} color={COLORS.primary} strokeWidth={2} />}
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity style={styles.nearbyChatBtn}>
                      <Navigation size={18} color={COLORS.primary} strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              )}
            />
          )}
        </Animated.View>
      )}

      {/* ── TOP BAR (Challenges & Bell) ── */}
      <View style={[styles.topBarContainer, { top: searchTop }]} pointerEvents="box-none">
        
        {/* CHALLENGES (Trophy) Left */}
        <TouchableOpacity
          style={styles.topRoundBtn}
          onPress={() => setShowChallengesModal(true)}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 22 }}>🏆</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
        
        {/* NOTIFICATIONS Right */}
        <TouchableOpacity style={styles.topRoundBtn} onPress={() => router.push("/(main)/notifications")} activeOpacity={0.8}>
          <Bell size={22} color={COLORS.primary} strokeWidth={2.5} />
          {unreadNotifCount > 0 && (
            <View style={styles.notiDot}>
              <Text style={{ color: '#fff', fontSize: 8, fontWeight: 'bold' }}>
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* ── FIT ALL FRIENDS BUTTON ── */}
      <TouchableOpacity
        style={[styles.topRoundBtn, { position: "absolute", right: 16, bottom: insets.bottom + 175, zIndex: 10 }]}
        onPress={fitAllFriends}
        activeOpacity={0.8}
      >
        <Globe size={22} color={COLORS.primary} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* ── MY LOCATION BUTTON ── */}
      <TouchableOpacity
        style={[styles.topRoundBtn, { position: "absolute", right: 16, bottom: insets.bottom + 110, zIndex: 10 }]}
        onPress={centerOnMe}
        activeOpacity={0.8}
      >
        <Navigation size={22} color={COLORS.accent} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* ── BOTTOM ACTION ROW (Profile | Chat | Moment) ── */}
      <View style={{
        position: 'absolute',
        bottom: insets.bottom + 28,
        left: 0, right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end',
        pointerEvents: 'box-none',
        gap: 24,
        zIndex: 10
      }}>
        {/* Profile Button (Bottom Left) */}
        <TouchableOpacity 
           style={[styles.topRoundBtn, { width: 48, height: 48, borderRadius: 24, marginBottom: 10 }]} 
           onPress={() => router.push("/(main)/profile")} 
           activeOpacity={0.8}
        >
          <User size={22} color={COLORS.primary} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Chat Button (Center) */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity 
             style={[styles.topRoundBtn, { width: 68, height: 68, borderRadius: 34 }]} 
             onPress={() => router.push("/(main)/chat")} 
             activeOpacity={0.9}
          >
            <MessageCircle size={32} color={COLORS.primary} strokeWidth={2.5} />
            {totalUnreadCount > 0 && (
              <View style={styles.chatBadge}>
                <Text style={styles.chatBadgeText}>
                  {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Moment Button (Bottom Right) */}
        <TouchableOpacity
          style={[styles.topRoundBtn, { width: 48, height: 48, borderRadius: 24, marginBottom: 10 }]}
          onPress={() => setShowMomentCamera(true)}
          activeOpacity={0.8}
        >
          <Camera size={22} color={COLORS.primary} strokeWidth={2.5} />
        </TouchableOpacity>
      </View>

      {/* ── FRIEND POPUP ── */}
      {selectedFriend && (() => {
        const auraTheme = getAuraTheme(selectedFriend.optional?.rank?.aura);
        return (
          <Animated.View style={[styles.popupOverlay, { bottom: insets.bottom + 16, transform: [{ translateY: popupSlide }] }]}>
            <View style={[styles.popupCard, { padding: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24, backgroundColor: auraTheme.bg, borderColor: auraTheme.border, borderWidth: 1.5 }]}>
              {/* ── Header: Avatar & Basic Info ── */}
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View>
                  {selectedFriend.basicInfo.avatarUrl ? (
                    <Image source={{ uri: selectedFriend.basicInfo.avatarUrl }} style={{ width: 60, height: 60, borderRadius: 30 }} />
                  ) : (
                    <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center' }}>
                      <Text style={{ color: '#fff', fontSize: 24 }}>{selectedFriend.basicInfo.fullName.charAt(0)}</Text>
                    </View>
                  )}
                  {/* Online Badge */}
                  <View style={{
                    position: 'absolute', bottom: 2, right: 2, width: 16, height: 16, borderRadius: 8,
                    backgroundColor: selectedFriend.basicInfo.onlineStatus === 'ONLINE' ? COLORS.online : '#94A3B8',
                    borderWidth: 2, borderColor: COLORS.bgWhite
                  }} />
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: COLORS.textPrimary, marginRight: 6 }} numberOfLines={1}>
                      {selectedFriend.basicInfo.fullName}
                    </Text>
                    {/* Rank Level Tag */}
                    {selectedFriend.optional?.rank?.level && (
                      <TouchableOpacity
                        style={{ backgroundColor: auraTheme.bgLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: auraTheme.accent + '40' }}
                        onPress={() => setShowIntimacyModal(true)}
                        activeOpacity={0.7}
                      >
                        <Text style={{ fontSize: 10, color: auraTheme.accent, fontWeight: 'bold' }}>Lv.{selectedFriend.optional.rank.level}</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  {selectedFriend.basicInfo.username ? (
                    <Text style={{ fontSize: 13, color: COLORS.textSecondary, marginTop: 2 }}>@{selectedFriend.basicInfo.username}</Text>
                  ) : null}

                  <Text style={{ fontSize: 12, color: selectedFriend.basicInfo.onlineStatus === 'ONLINE' ? COLORS.online : COLORS.textMuted, marginTop: 4 }}>
                    {selectedFriend.basicInfo.onlineStatus === 'ONLINE' ? 'Trực tuyến' : `Hoạt động: ${selectedFriend.basicInfo.lastActive}`}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{ padding: 8, backgroundColor: COLORS.surfaceHighlight, borderRadius: 20 }}
                  onPress={closePopup}
                >
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>

              {selectedFriend.relationship.status === 'FRIEND' && (
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  {selectedFriend.basicInfo.mutualFriends !== undefined && (
                    <Text style={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' }}>
                      🤝 {selectedFriend.basicInfo.mutualFriends} bạn chung
                    </Text>
                  )}
                  {selectedFriend.activity.statusMessage ? (
                    <View style={{ backgroundColor: COLORS.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, maxWidth: '60%' }}>
                      <Text style={{ fontSize: 12, color: COLORS.primary, fontStyle: 'italic' }} numberOfLines={1}>
                        "{selectedFriend.activity.statusMessage}"
                      </Text>
                    </View>
                  ) : null}
                </View>
              )}

              {/* ── Location Box ── */}
              <View style={{ backgroundColor: '#F8FAFC', borderRadius: 16, padding: 12, marginBottom: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                  <MapPin size={18} color={COLORS.primary} style={{ marginTop: 2 }} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: COLORS.textPrimary }} numberOfLines={2}>
                      {selectedFriend.relationship.status === 'FRIEND' ? selectedFriend.location.address : "Khu vực đang bị khóa vì chưa kết bạn"}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                      <Text style={{ fontSize: 12, color: COLORS.textSecondary }}>Cách {selectedFriend.location.distance}</Text>
                      {selectedFriend.relationship.status === 'FRIEND' && (
                        <>
                          <Text style={{ fontSize: 12, color: COLORS.textMuted, marginHorizontal: 6 }}>•</Text>
                          <Text style={{ fontSize: 12, color: COLORS.textMuted }}>Cập nhật {selectedFriend.location.updatedAt}</Text>
                        </>
                      )}
                    </View>
                  </View>
                </View>

                {/* Activity / Battery Row */}
                {selectedFriend.relationship.status === 'FRIEND' && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E2E8F0' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      {selectedFriend.activity.battery !== null ? (
                        <>
                          {selectedFriend.activity.isCharging ? (
                            <BatteryCharging size={16} color="#10B981" />
                          ) : (
                            <Battery size={16} color={selectedFriend.activity.battery > 20 ? '#10B981' : '#EF4444'} />
                          )}
                          <Text style={{ fontSize: 12, fontWeight: '500', color: COLORS.textSecondary, marginLeft: 4 }}>
                            {selectedFriend.activity.battery}%
                          </Text>
                        </>
                      ) : null}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                      <Text style={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' }}>
                        {selectedFriend.activity.speed > 15 ? `🚗 ${selectedFriend.activity.speed} km/h` : selectedFriend.activity.speed > 7 ? `🏃 ${selectedFriend.activity.speed} km/h` : selectedFriend.activity.speed > 0 ? `🚶 ${selectedFriend.activity.speed} km/h` : "🚶 Đang dừng"}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'flex-end' }}>
                        <Text style={{ fontSize: 12, color: COLORS.textMuted }}>✓ Bạn bè</Text>
                    </View>
                  </View>
                )}
              </View>

              {selectedFriend.relationship.status === 'FRIEND' && (
                <>
                  {/* ── Quick Actions Row ── */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <TouchableOpacity
                      style={{ flex: 1, alignItems: 'center', marginHorizontal: 2 }}
                      onPress={() => handleStartChat(selectedFriend.basicInfo.userId)}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: COLORS.primaryLight, justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                        <MessageCircle size={20} color={COLORS.primary} />
                      </View>
                      <Text style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' }}>Nhắn tin</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flex: 1, alignItems: 'center', marginHorizontal: 2 }}
                      onPress={() => router.push({
                        pathname: "/(main)/call",
                        params: {
                          targetUserId: selectedFriend.basicInfo.userId,
                          isVideoCall: 'false',
                          isIncoming: 'false',
                          fullname: selectedFriend.basicInfo.fullName,
                          avatarUrl: selectedFriend.basicInfo.avatarUrl || "https://ui-avatars.com/api/?name=User"
                        }
                      })}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                        <Phone size={20} color="#10B981" />
                      </View>
                      <Text style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' }}>Gọi điện</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flex: 1, alignItems: 'center', marginHorizontal: 2 }}
                      onPress={() => router.push({
                        pathname: "/(main)/call",
                        params: {
                          targetUserId: selectedFriend.basicInfo.userId,
                          isVideoCall: 'true',
                          isIncoming: 'false',
                          fullname: selectedFriend.basicInfo.fullName,
                          avatarUrl: selectedFriend.basicInfo.avatarUrl || "https://ui-avatars.com/api/?name=User"
                        }
                      })}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#E0E7FF', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                        <Video size={20} color="#6366F1" />
                      </View>
                      <Text style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' }}>Video</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flex: 1, alignItems: 'center', marginHorizontal: 2 }}
                      onPress={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${selectedFriend.location.latitude},${selectedFriend.location.longitude}`;
                        Linking.openURL(url);
                      }}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#EFF6FF', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                        <Navigation size={20} color="#3B82F6" />
                      </View>
                      <Text style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' }}>Đường đi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{ flex: 1, alignItems: 'center', marginHorizontal: 2 }}
                      onPress={() => socketService.emit('ping_friend', { friendId: selectedFriend.basicInfo.userId })}
                    >
                      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#FEF2F2', justifyContent: 'center', alignItems: 'center', marginBottom: 4 }}>
                        <BellRing size={20} color="#EF4444" />
                      </View>
                      <Text style={{ fontSize: 10, color: COLORS.textSecondary, fontWeight: '500' }}>Vẫy tay</Text>
                    </TouchableOpacity>
                  </View>

                  {/* ── Action Buttons Row (Tặng quà & Xem điểm) ── */}
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        paddingVertical: 10, paddingHorizontal: 12, marginRight: 8,
                        backgroundColor: '#FFF1F2', borderRadius: 16, borderWidth: 1, borderColor: '#FDA4AF'
                      }}
                      onPress={() => setShowGiftModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 13, marginRight: 6 }}>🎁</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: '#F43F5E' }}>Tặng quà</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={{
                        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                        paddingVertical: 10, paddingHorizontal: 12,
                        backgroundColor: auraTheme.bgLight, borderRadius: 16, borderWidth: 1, borderColor: auraTheme.accent + '40',
                      }}
                      onPress={() => setShowIntimacyModal(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={{ fontSize: 13, marginRight: 6 }}>💛</Text>
                      <Text style={{ fontSize: 13, fontWeight: '700', color: auraTheme.text }}>Kiểm tra ĐTM</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}

              {/* ── Add/Unfriend & Request Location Actions ── */}
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10, gap: 10 }}>
                {selectedFriend.relationship.status === 'FRIEND' ? (
                  <>
                    <TouchableOpacity
                      style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: COLORS.surfaceHighlight, borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => socketService.emit('req_location_update', { friendId: selectedFriend.basicInfo.userId })}
                    >
                      <MapPin size={14} color={COLORS.textSecondary} style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 12, color: COLORS.textSecondary, fontWeight: '500' }}>Cập nhật vị trí</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{ paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#FEF2F2', borderRadius: 20, flexDirection: 'row', alignItems: 'center' }}
                      onPress={() => {
                        Alert.alert(
                          "Hủy bạn",
                          `Bạn có chắc chắn muốn hủy kết bạn với ${selectedFriend.basicInfo.fullName}?`,
                          [
                            { text: "Từ chối", style: "cancel" },
                            { text: "Đồng ý", onPress: async () => {
                                try {
                                  await unfriend(selectedFriend.basicInfo.userId);
                                  Alert.alert("Thành công", "Đã hủy kết bạn.");
                                  closePopup();
                                  fetchFriends();
                                } catch (e: any) {
                                  Alert.alert("Lỗi", e?.message || "Không thể hủy kết bạn");
                                }
                            }}
                          ]
                        );
                      }}
                    >
                      <X size={14} color="#EF4444" style={{ marginRight: 6 }} />
                      <Text style={{ fontSize: 12, color: '#EF4444', fontWeight: '500' }}>Hủy bạn</Text>
                    </TouchableOpacity>
                  </>
                ) : (
                  <TouchableOpacity
                    style={{ flex: 1, paddingVertical: 12, backgroundColor: COLORS.primary, borderRadius: 20, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => {
                      Alert.alert(
                        "Kết bạn",
                        `Bạn có chắc chắn muốn gửi lời mời kết bạn đến ${selectedFriend.basicInfo.fullName}?`,
                        [
                          { text: "Từ chối", style: "cancel" },
                          { text: "Đồng ý", onPress: async () => {
                              try {
                                const res: any = await sendFriendRequest(selectedFriend.basicInfo.userId);
                                if (res.success) {
                                  Alert.alert("Thành công", "Đã gửi lời mời kết bạn.");
                                  closePopup();
                                } else {
                                  Alert.alert("Lỗi", res.message || "Không thể gửi lời mời.");
                                }
                              } catch (e: any) {
                                Alert.alert("Lỗi", e?.message || "Không thể gửi lời mời.");
                              }
                          }}
                        ]
                      );
                    }}
                  >
                    <UserPlus size={16} color="#FFF" style={{ marginRight: 6 }} />
                    <Text style={{ fontSize: 14, color: '#FFF', fontWeight: 'bold' }}>Thêm bạn</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        );
      })()}
      {selectedFriend && (
        <IntimacyDetailsModal
          visible={showIntimacyModal}
          onClose={() => setShowIntimacyModal(false)}
          friendName={selectedFriend.basicInfo.fullName}
          rankData={selectedFriend.optional?.rank ? {
            level: selectedFriend.optional.rank.level,
            name: selectedFriend.optional.rank.name,
            currentExp: selectedFriend.optional.rank.currentExp,
            nextLevelExp: selectedFriend.optional.rank.nextLevelExp,
            progressPercent: selectedFriend.optional.rank.progressPercent,
            currentStreak: selectedFriend.optional.rank.currentStreak,
            longestStreak: selectedFriend.optional.rank.longestStreak,
            aura: selectedFriend.optional.rank.aura,
          } : null}
        />
      )}

      {selectedFriend && (
        <GiftShopModal
          isVisible={showGiftModal}
          onClose={() => setShowGiftModal(false)}
          targetFriendId={selectedFriend.basicInfo.userId}
          targetFriendName={selectedFriend.basicInfo.fullName}
        />
      )}

      {/* ── CHALLENGES MODAL ── */}
      <ChallengesModal
        visible={showChallengesModal}
        onClose={() => setShowChallengesModal(false)}
        onOpenInventory={() => {
          setShowChallengesModal(false);
          setTimeout(() => setShowInventoryModal(true), 300);
        }}
      />

      {/* ── INVENTORY MODAL ── */}
      <InventoryModal
        visible={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
      />

      {/* ── GIFT ANIMATION ── */}
      <GlobalGiftAnimation />

      {/* ── PING! OVERLAY MODAL ── */}
      {(() => {
        if (!pingEvent) return null;
        const isUser1Me = pingEvent.user1 === userProfile?.userId;
        const pingFriendName = isUser1Me
          ? (pingEvent.user2Name || "Ai đó")
          : (pingEvent.user1Name || "Ai đó");

        return (
          <Animated.View
            {...pingPanResponder.panHandlers}
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: 'rgba(15, 23, 42, 0.7)', zIndex: 10000, justifyContent: 'center', alignItems: 'center' },
              { transform: [{ translateY: pingPanY }] }
            ]}
          >
            <Animated.View style={{ transform: [{ scale: pulseAnim }], alignItems: 'center' }}>
              <Text style={{ fontSize: 90, fontWeight: '900', color: COLORS.white, textShadowColor: '#F43F5E', textShadowRadius: 30, fontStyle: 'italic' }}>Ping!</Text>
              <View style={{ backgroundColor: '#F43F5E', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 10, maxWidth: '80%' }}>
                <Text style={{ color: COLORS.white, fontWeight: '700', fontSize: 16, textAlign: 'center' }} numberOfLines={2}>
                  {pingFriendName} đang ở gần bạn!
                </Text>
              </View>
            </Animated.View>

            <View style={{ position: 'absolute', bottom: insets.bottom + 60, alignItems: 'center' }}>
              <Text style={{ color: COLORS.textMuted, fontSize: 14, marginBottom: 8 }}>Vuốt xuống để xem trên bản đồ</Text>
              <View style={{ width: 40, height: 6, backgroundColor: COLORS.textMuted, borderRadius: 3, opacity: 0.5 }} />
            </View>
          </Animated.View>
        );
      })()}

      {/* ── MOMENT CAMERA (fullscreen overlay — must sit above ALL HomeScreen elements) ── */}
      {showMomentCamera && (
        <View style={[StyleSheet.absoluteFill, { zIndex: 99999, elevation: 99999 }]}>
          <MomentCameraScreen
            onClose={() => setShowMomentCamera(false)}
            onOpenGlobalFeed={() => {
              setShowMomentCamera(false);
              setMomentFeedMode("global");
              setShowMomentFeed(true);
            }}
            onMomentCreated={() => {
              fetchMomentClusters();
            }}
          />
        </View>
      )}

      {/* ── MOMENT FEED MODAL ── */}
      <MomentFeedModal
        visible={showMomentFeed}
        mode={momentFeedMode}
        localCoord={selectedClusterCoord}
        onClose={() => {
          setShowMomentFeed(false);
          setSelectedClusterCoord(null);
        }}
        onNavigateToLocation={(lat: number, lng: number) => {
          setShowMomentFeed(false);
          setSelectedClusterCoord(null);
          if (mapRef.current) {
            mapRef.current.animateToRegion(
              { latitude: lat, longitude: lng, latitudeDelta: 0.005, longitudeDelta: 0.005 },
              1000
            );
          }
        }}
      />
    </View>
  );
};
