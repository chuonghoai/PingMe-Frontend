import { useRouter } from "expo-router";
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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import {
  Bell,
  MapPin,
  MessageCircle,
  Navigation,
  Search,
  User,
  X,
} from "lucide-react-native";

import { COLORS, styles } from "./HomeScreen.styles";
import { SNAZZY_MAP_STYLE } from "@/constants/theme";
import { getFriendPopup, getFriendsOnMap } from "@/services/mapApi";
import { getNearbyUsers } from "@/services/profileApi";
import { socketService } from "@/websockets/socketService";
import { useUser } from "@/store/UserContext";
import { ChatContext } from "@/features/chat/store/ChatContext";

// ── Types ──
interface FriendOnMap {
  userId: string;
  avatarUrl: string;
  latitude: number;
  longitude: number;
  onlineStatus: "ONLINE" | "OFFLINE";
}

interface FriendPopupData {
  basicInfo: {
    userId: string;
    fullName: string;
    username: string;
    avatarUrl: string;
    onlineStatus: string;
    lastActive: string;
  };
  location: {
    address: string;
    distance: string;
  };
  activity: {
    statusMessage: string;
    battery: number;
    speed: number;
  };
  actions: {
    canChat: boolean;
    canNavigate: boolean;
  };
}

// ── Default region ──
const DEFAULT_REGION = {
  latitude: 10.7769,
  longitude: 106.7009,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

// ── Radar Pulse Marker (renders INSIDE Marker with tracksViewChanges=true) ──
const RadarPulseMarker = React.memo(({ avatarUrl, initials }: {
  avatarUrl?: string;
  initials: string;
}) => {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;
  const ring3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const startPulse = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, {
            toValue: 1,
            duration: 3500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(anim, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      ).start();
    };
    startPulse(ring1, 0);
    startPulse(ring2, 1200);
    startPulse(ring3, 2400);
  }, []);

  const getRingStyle = (anim: Animated.Value) => ({
    position: 'absolute' as const,
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2.5,
    borderColor: '#00C2FF',
    backgroundColor: 'transparent',
    transform: [{ scale: anim.interpolate({ inputRange: [0, 1], outputRange: [1, 2.8] }) }],
    opacity: anim.interpolate({ inputRange: [0, 0.1, 0.7, 1], outputRange: [0, 0.6, 0.1, 0] }),
  });

  return (
    <View style={styles.myMarkerContainer} pointerEvents="none">
      <Animated.View style={getRingStyle(ring1)} />
      <Animated.View style={getRingStyle(ring2)} />
      <Animated.View style={getRingStyle(ring3)} />
      <View style={styles.myAvatarRing}>
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.myAvatar} />
        ) : (
          <View style={[styles.myAvatar, styles.myAvatarFallback]}>
            <Text style={styles.myAvatarText}>{initials}</Text>
          </View>
        )}
      </View>
    </View>
  );
});

export const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { userProfile } = useUser();
  const { totalUnreadCount } = React.useContext(ChatContext);
  const searchInputRef = useRef<TextInput>(null);

  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // ── State ──
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [friends, setFriends] = useState<FriendOnMap[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<FriendPopupData | null>(null);
  const [region, setRegion] = useState(DEFAULT_REGION);

  // ── Search & Animation State ──
  const [isSearching, setIsSearching] = useState(false);
  const searchAnim = useRef(new Animated.Value(0)).current;

  // ── Nearby Users (all users, not just friends) ──
  const [nearbyUsers, setNearbyUsers] = useState<any[]>([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // ── Animations ──
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const popupSlide = useRef(new Animated.Value(300)).current;

  const initials = userProfile?.firstName
    ? userProfile.firstName.charAt(0).toUpperCase()
    : "?";

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
          setRegion({ ...coords, latitudeDelta: 0.015, longitudeDelta: 0.015 });
          socketService.emit("update_location", { lat: coords.latitude, lng: coords.longitude });
        }

        // Step 2: Start watchPositionAsync — this is the RELIABLE method for
        // Android emulators. Unlike getCurrentPositionAsync which often fails
        // on emulators, watchPositionAsync registers a listener with the Fused
        // Location Provider and reliably picks up mock locations.
        let gotFirstLocation = !!initialLoc;

        const watchPromise = new Promise<void>(async (resolve) => {
          try {
            locationWatcher = await Location.watchPositionAsync(
              {
                accuracy: Location.Accuracy.Balanced,
                timeInterval: 10000,
                distanceInterval: 10,
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
                  setRegion({ ...newCoords, latitudeDelta: 0.015, longitudeDelta: 0.015 });
                }

                setUserLocation(newCoords);
                socketService.emit("update_location", {
                  lat: newCoords.latitude,
                  lng: newCoords.longitude,
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

        // Step 3: Wait up to 10s for the first location from the watcher
        // If we already have initialLoc, don't need to wait
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
            }, 10000)
          );

          await Promise.race([watchPromise, timeoutPromise]);
        }

        await fetchFriends();
      } catch (error) {
        console.log("[Map] Init error:", error);
      } finally {
        setIsLoading(false);
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
    const handleFriendLocationUpdate = (data: { userId: string; lat: number; lng: number; avatarUrl?: string }) => {
      setFriends((prev) => {
        const friendExists = prev.some((f) => f.userId === data.userId);
        if (friendExists) {
          return prev.map((f) =>
            f.userId === data.userId ? { ...f, latitude: data.lat, longitude: data.lng, onlineStatus: "ONLINE" } : f
          );
        } else {
          // Add the newly online friend to the map
          return [
            ...prev,
            {
              userId: data.userId,
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

    socketService.on("friend_location_update", handleFriendLocationUpdate);
    socketService.on("user_online", handleUserOnline);
    socketService.on("user_offline", handleUserOffline);

    return () => {
      socketService.off("friend_location_update", handleFriendLocationUpdate);
      socketService.off("user_online", handleUserOnline);
      socketService.off("user_offline", handleUserOffline);
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

  // ── Map Reload Interval ──
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchFriends();
    }, 10000); // Reload friends map every 10 seconds

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
      fetchNearbyUsers(); // Load nearby users khi mở search
    }
    Animated.timing(searchAnim, {
      toValue: open ? 1 : 0,
      duration: 350,
      easing: Easing.out(Easing.exp),
      useNativeDriver: false,
    }).start(() => {
      if (!open) setIsSearching(false);
      else searchInputRef.current?.focus();
    });
    if (!open) searchInputRef.current?.blur();
  };

  // ── Search Animated Styles ──
  const startTop = screenHeight - insets.bottom - 110 - 48; // Bottom left start
  const endTop = insets.top + 12; // Top center end

  const searchTop = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [startTop, endTop]
  });
  const searchLeft = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 70]
  });
  const searchWidth = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [48, screenWidth - 140]
  });
  const searchBorderRadius = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 24]
  });
  const searchBackdropOpacity = searchAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1]
  });
  const searchContentOpacity = searchAnim.interpolate({
    inputRange: [0.5, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  const searchIconOpacity = searchAnim.interpolate({
    inputRange: [0, 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp'
  });
  const listTop = Animated.add(searchTop, 56); // Place 8px below the 48px high search bar

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

  const centerOnMe = useCallback(() => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        { ...userLocation, latitudeDelta: 0.01, longitudeDelta: 0.01 },
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
        customMapStyle={SNAZZY_MAP_STYLE}
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
        {userLocation && (
          <Marker
            coordinate={userLocation}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={true}
          >
            <RadarPulseMarker
              avatarUrl={userProfile?.avatarUrl}
              initials={initials}
            />
          </Marker>
        )}

        {friends.map((friend) => {
          const displayAvatar = friend.avatarUrl || `https://ui-avatars.com/api/?name=F&background=8B5CF6&color=fff&size=128`;
          return (
            <Marker
              key={friend.userId}
              coordinate={{ latitude: friend.latitude, longitude: friend.longitude }}
              onPress={() => handleFriendPress(friend.userId)}
              anchor={{ x: 0.5, y: 0.5 }}
              tracksViewChanges={true}
            >
              <View style={styles.friendMarker}>
                <View style={[styles.friendAvatarWrapper, friend.onlineStatus === "OFFLINE" && styles.friendAvatarWrapperOffline]}>
                  <Image source={{ uri: displayAvatar }} style={styles.friendAvatar} />
                </View>
                {friend.onlineStatus === "ONLINE" && <View style={styles.onlineDot} />}
              </View>
            </Marker>
          );
        })}
      </MapView>


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
          { top: searchTop, left: searchLeft, width: searchWidth, borderRadius: searchBorderRadius }
        ]}
      >
        {/* Unexpanded FAB State */}
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: searchIconOpacity, justifyContent: 'center', alignItems: 'center' }]}>
          <TouchableOpacity
            style={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}
            onPress={() => toggleSearch(true)}
            disabled={isSearching}
          >
            <Search size={22} color={COLORS.primary} strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>

        {/* Expanded Search State */}
        <Animated.View style={[{ opacity: searchContentOpacity }, styles.heroSearchExpanded]} pointerEvents={isSearching ? "auto" : "none"}>
          <Search size={18} color={COLORS.textSecondary} />
          <TextInput
            ref={searchInputRef}
            style={styles.heroSearchInput}
            placeholder="Tìm bạn bè xung quanh..."
            placeholderTextColor={COLORS.textMuted}
          />
          <TouchableOpacity onPress={() => toggleSearch(false)} style={{ padding: 4 }}>
            <X size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
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
          {isLoadingNearby ? (
            <ActivityIndicator size="small" color={COLORS.primary} style={{ paddingVertical: 16 }} />
          ) : nearbyUsers.length === 0 ? (
            <Text style={styles.emptyNearby}>Chưa có ai ở gần đây.</Text>
          ) : (
            <FlatList
              data={nearbyUsers}
              keyExtractor={item => item.userId}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.nearbyItem} onPress={() => handleFriendPress(item.userId)}>
                  <Image
                    source={{ uri: item.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.fullName?.charAt(0) || 'U')}&background=8B5CF6&color=fff&size=128` }}
                    style={styles.nearbyAvatar}
                  />
                  <View style={styles.nearbyInfo}>
                    <Text style={styles.nearbyName}>{item.fullName || 'Người dùng'}</Text>
                    <Text style={styles.nearbyDistance}>Cách đây {item.distance}</Text>
                  </View>
                  <TouchableOpacity style={styles.nearbyChatBtn}>
                    <MessageCircle size={18} color={COLORS.primary} strokeWidth={2} />
                  </TouchableOpacity>
                </TouchableOpacity>
              )}
            />
          )}
        </Animated.View>
      )}

      {/* ── TOP BAR (Profile & Bell) ── */}
      {/* Set pointerEvents box-none so the middle area passes touches to the map */}
      <View style={[styles.topBarContainer, { top: insets.top + 12 }]} pointerEvents="box-none">
        <TouchableOpacity style={styles.topRoundBtn} onPress={() => router.push("/(main)/profile")} activeOpacity={0.8}>
          <User size={24} color={COLORS.primary} strokeWidth={2.5} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.topRoundBtn} onPress={() => { }} activeOpacity={0.8}>
          <Bell size={22} color={COLORS.primary} strokeWidth={2.5} />
          <View style={styles.notiDot} />
        </TouchableOpacity>
      </View>

      {/* ── MY LOCATION BUTTON ── */}
      <TouchableOpacity
        style={[styles.topRoundBtn, { position: "absolute", right: 16, bottom: insets.bottom + 110, zIndex: 10 }]}
        onPress={centerOnMe}
        activeOpacity={0.8}
      >
        <Navigation size={22} color={COLORS.accent} strokeWidth={2.5} />
      </TouchableOpacity>

      {/* ── CHAT FAB ── */}
      <Animated.View
        style={[styles.floatingBtnWrapper, { bottom: insets.bottom + 28, alignSelf: "center", transform: [{ scale: pulseAnim }] }]}
      >
        <TouchableOpacity style={styles.chatBtn} onPress={() => router.push("/(main)/chat")} activeOpacity={0.9}>
          <MessageCircle size={30} color={COLORS.white} strokeWidth={2} />
          {totalUnreadCount > 0 && (
            <View style={styles.chatBadge}>
              <Text style={styles.chatBadgeText}>
                {totalUnreadCount > 99 ? "99+" : totalUnreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* ── FRIEND POPUP ── */}
      {selectedFriend && (
        <Animated.View style={[styles.popupOverlay, { bottom: insets.bottom + 16, transform: [{ translateY: popupSlide }] }]}>
          <View style={styles.popupCard}>
            <View style={styles.popupHeader}>
              {selectedFriend.basicInfo.avatarUrl ? (
                <Image source={{ uri: selectedFriend.basicInfo.avatarUrl }} style={styles.popupAvatar} />
              ) : (
                <View style={styles.popupAvatarPlaceholder}>
                  <Text style={styles.popupAvatarText}>
                    {selectedFriend.basicInfo.fullName.charAt(0)}
                  </Text>
                </View>
              )}
              <View style={styles.popupInfo}>
                <Text style={styles.popupName} numberOfLines={1}>
                  {selectedFriend.basicInfo.fullName}
                </Text>
                <Text style={[styles.popupStatus, selectedFriend.basicInfo.onlineStatus !== "ONLINE" && styles.popupStatusOffline]}>
                  {selectedFriend.basicInfo.onlineStatus === "ONLINE"
                    ? "● Online"
                    : `○ ${selectedFriend.basicInfo.lastActive}`}
                </Text>
              </View>
              <TouchableOpacity style={styles.popupClose} onPress={closePopup}>
                <X size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.popupDetails}>
              <View style={styles.popupDetailItem}>
                <Text style={styles.popupDetailValue}>{selectedFriend.location.distance}</Text>
                <Text style={styles.popupDetailLabel}>Khoảng cách</Text>
              </View>
              <View style={styles.popupDetailItem}>
                <Text style={styles.popupDetailValue}>{selectedFriend.activity.battery}%</Text>
                <Text style={styles.popupDetailLabel}>Pin</Text>
              </View>
              <View style={styles.popupDetailItem}>
                <Text style={styles.popupDetailValue}>
                  {selectedFriend.activity.speed > 0 ? `${selectedFriend.activity.speed} km/h` : "Idle"}
                </Text>
                <Text style={styles.popupDetailLabel}>Tốc độ</Text>
              </View>
            </View>

            <View style={styles.popupActions}>
              {selectedFriend.actions.canChat && (
                <TouchableOpacity style={[styles.popupActionBtn, styles.popupActionBtnPrimary]} activeOpacity={0.8}>
                  <MessageCircle size={16} color={COLORS.white} />
                  <Text style={[styles.popupActionText, styles.popupActionTextPrimary]}>Chat</Text>
                </TouchableOpacity>
              )}
              {selectedFriend.actions.canNavigate && (
                <TouchableOpacity style={styles.popupActionBtn} activeOpacity={0.8}>
                  <MapPin size={16} color={COLORS.primary} />
                  <Text style={styles.popupActionText}>Dẫn đường</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animated.View>
      )}
    </View>
  );
};
