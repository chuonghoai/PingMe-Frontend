import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  Dimensions,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  X,
  ImageIcon,
  Send,
  RotateCcw,
  Navigation,
  Trash2,
  ChevronDown,
  RefreshCw,
  Zap,
} from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { momentCameraStyles as styles } from "./MomentCameraScreen.styles";
import { mediaApi } from "@/services/mediaApi";
import { momentsApi } from "@/services/momentsApi";
import { useUser } from "@/store/UserContext";

interface MomentItem {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  imageUrl: string;
  caption: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
  isMine?: boolean;
}

interface MomentCameraScreenProps {
  onClose: () => void;
  onOpenGlobalFeed: () => void;
  onMomentCreated?: () => void;
  onNavigateToLocation?: (lat: number, lng: number) => void;
}

// ── Time formatting helper ──
const formatTimeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

export const MomentCameraScreen = ({
  onClose,
  onOpenGlobalFeed,
  onMomentCreated,
  onNavigateToLocation,
}: MomentCameraScreenProps) => {
  const insets = useSafeAreaInsets();
  const { userProfile } = useUser();

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [previewBase64, setPreviewBase64] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<any>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [facing, setFacing] = useState<'back' | 'front'>('back');

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  useEffect(() => {
    if (permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission]);

  // ── Feed State (history) ──
  const [feedMoments, setFeedMoments] = useState<MomentItem[]>([]);
  const [feedPage, setFeedPage] = useState(1);
  const [feedHasMore, setFeedHasMore] = useState(true);
  const [feedLoading, setFeedLoading] = useState(false);

  // ── Fetch global feed ──
  const fetchFeed = useCallback(async (page: number = 1, append: boolean = false) => {
    try {
      setFeedLoading(true);
      const res: any = await momentsApi.getGlobalFeed(page);
      if (res?.success && res?.data) {
        const newMoments = res.data.moments || [];
        setFeedMoments((prev) => (append ? [...prev, ...newMoments] : newMoments));
        setFeedHasMore(res.data.hasMore || false);
        setFeedPage(page);
      }
    } catch (error) {
      console.log("[Moment] Feed fetch error:", error);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed(1, false);
  }, []);

  // ── Get current location ──
  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Vui lòng cấp quyền truy cập vị trí");
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const coords = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      };
      setCurrentLocation(coords);
      return coords;
    } catch (error) {
      console.log("[Moment] Location error:", error);
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại");
      return null;
    }
  };

  // ── Take Photo ──
  const takePhoto = useCallback(async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) {
        Alert.alert("Lỗi", "Vui lòng cấp quyền Camera");
        return;
      }
    }
    
    try {
      if (cameraRef.current) {
        setIsCapturing(true);
        const result = await cameraRef.current.takePictureAsync({
          quality: 0.5,
          base64: true,
        });
        if (result?.uri) {
          setTimeout(() => {
            setPhotoUri(result.uri);
            if (result.base64) {
              setPreviewBase64(`data:image/jpeg;base64,${result.base64}`);
            } else {
              setPreviewBase64(result.uri);
            }
            getCurrentLocation();
            setIsCapturing(false);
          }, 300);
        } else {
          setIsCapturing(false);
        }
      }
    } catch (error) {
      console.log("[Moment] Camera error:", error);
      Alert.alert("Lỗi", "Không thể chụp ảnh");
      setIsCapturing(false);
    }
  }, [permission]);

  // ── Pick from Gallery ──
  const pickFromGallery = useCallback(async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Vui lòng cấp quyền truy cập thư viện ảnh");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets[0]) {
        setPhotoUri(result.assets[0].uri);
        setPreviewBase64(result.assets[0].uri);
        getCurrentLocation();
      }
    } catch (error) {
      console.log("[Moment] Gallery error:", error);
      Alert.alert("Lỗi", "Không thể mở thư viện ảnh");
    }
  }, []);

  // ── Retake Photo ──
  const retakePhoto = () => {
    setPhotoUri(null);
    setPreviewBase64(null);
    setCaption("");
  };

  // ── Post Moment ──
  const postMoment = useCallback(async () => {
    if (!photoUri) return;
    try {
      setIsUploading(true);

      let location = currentLocation;
      if (!location) {
        location = await getCurrentLocation();
        if (!location) {
          setIsUploading(false);
          return;
        }
      }

      const signatureData = await mediaApi.getSignature();
      const cloudinaryResult = await mediaApi.uploadToCloudinary(
        photoUri,
        signatureData,
        "image",
        "image/jpeg"
      );
      await mediaApi.createMediaRecord(cloudinaryResult);

      await momentsApi.createMoment({
        imageUrl: cloudinaryResult.secure_url,
        caption: caption.trim() || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      onMomentCreated?.();
      setPhotoUri(null);
      setPreviewBase64(null);
      setCaption("");
      fetchFeed(1, false); // Refresh feed after posting
      Alert.alert("Thành công", "Khoảnh khắc đã được ghim lên bản đồ! 📍");
    } catch (error) {
      console.log("[Moment] Post error:", error);
      Alert.alert("Lỗi", "Không thể đăng khoảnh khắc. Vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  }, [photoUri, caption, currentLocation]);

  // ── Delete moment ──
  const handleDelete = (momentId: string) => {
    Alert.alert("Xóa khoảnh khắc", "Bạn có chắc muốn xóa?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await momentsApi.deleteMoment(momentId);
            setFeedMoments((prev) => prev.filter((m) => m.id !== momentId));
            onMomentCreated?.(); // Refresh clusters on map
          } catch (e) {
            Alert.alert("Lỗi", "Không thể xóa");
          }
        },
      },
    ]);
  };

  // ── Navigate to location ──
  const handleGoToLocation = (lat: number, lng: number) => {
    onClose();
    setTimeout(() => onNavigateToLocation?.(lat, lng), 300);
  };

  // ── Handle scroll near bottom → load more ──
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const nearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 200;
    if (nearBottom && feedHasMore && !feedLoading) {
      fetchFeed(feedPage + 1, true);
    }
  };

  return (
    <View style={[styles.container]}>
      {/* ── Close button ── */}
      <TouchableOpacity
        style={[styles.closeBtn, { top: Math.max(8, insets.top - 8) }]}
        onPress={onClose}
      >
        <X size={22} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 16 }]}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={200}
      >
        {/* ════════════════════════════════════════ */}
        {/* ── VIEWFINDER SECTION ──                */}
        {/* ════════════════════════════════════════ */}
        <View style={styles.viewfinderSection}>
          <View style={styles.viewfinderFrame}>
            {photoUri ? (
              <View style={[styles.viewfinderImage, { backgroundColor: '#1A1A1A', overflow: 'hidden' }]}>
                <Image
                  key={photoUri}
                  source={{ uri: previewBase64 || photoUri }}
                  style={{ width: "100%", height: "100%" }}
                  resizeMode="cover"
                />
                {/* Caption input overlayed on the image */}
                <View style={styles.captionOverlay}>
                  <TextInput
                    style={styles.captionInput}
                    placeholder="Viết caption..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                    maxLength={200}
                    returnKeyType="done"
                    blurOnSubmit
                  />
                </View>
              </View>
            ) : (
              <>
                <CameraView
                  style={styles.viewfinderImage}
                  facing={facing}
                  ref={cameraRef}
                  mute={true}
                />
                
                {/* Overlays when not captured */}
                {!isCapturing && (
                  <View style={[styles.viewfinderImage, { position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' }]} pointerEvents="none">
                    <Text style={[styles.viewfinderPlaceholderText, { textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 }]}>
                      Sẵn sàng chụp ảnh
                    </Text>
                  </View>
                )}
                {isCapturing && (
                  <View style={[styles.viewfinderImage, { position: 'absolute', justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                )}
              </>
            )}
          </View>
        </View>

        {/* ════════════════════════════════════════ */}
        {/* ── CONTROLS ──                          */}
        {/* ════════════════════════════════════════ */}
        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            {!photoUri ? (
              <>
                {/* Gallery Button */}
                <TouchableOpacity
                  style={styles.galleryBtn}
                  onPress={pickFromGallery}
                  activeOpacity={0.7}
                >
                  <ImageIcon size={22} color="#fff" strokeWidth={1.5} />
                </TouchableOpacity>

                {/* Capture Button (gold ring) */}
                <TouchableOpacity
                  style={styles.captureBtn}
                  onPress={takePhoto}
                  activeOpacity={0.7}
                  disabled={isCapturing}
                >
                  <View style={styles.captureBtnInner} />
                </TouchableOpacity>

                {/* Flip Camera */}
                <TouchableOpacity
                  style={styles.flipBtn}
                  activeOpacity={0.7}
                  onPress={toggleCameraFacing}
                >
                  <RefreshCw size={20} color="#fff" strokeWidth={1.8} />
                </TouchableOpacity>
              </>
            ) : (
              <>
                {/* Retake */}
                <TouchableOpacity
                  style={styles.retakeBtn}
                  onPress={retakePhoto}
                  activeOpacity={0.7}
                >
                  <RotateCcw size={20} color="#fff" strokeWidth={2} />
                </TouchableOpacity>

                {/* Post Button */}
                <TouchableOpacity
                  style={styles.postBtn}
                  onPress={postMoment}
                  activeOpacity={0.8}
                  disabled={isUploading}
                >
                  <Send size={24} color="#000" strokeWidth={2.5} />
                </TouchableOpacity>

                {/* Spacer */}
                <View style={{ width: 48 }} />
              </>
            )}
          </View>
        </View>

        {/* ════════════════════════════════════════ */}
        {/* ── HISTORY / FEED SECTION ──            */}
        {/* ════════════════════════════════════════ */}
        <View style={styles.historySection}>
          <View style={styles.historyRow}>
            <Image
              source={{
                uri:
                  userProfile?.avatarUrl ||
                  "https://ui-avatars.com/api/?name=U&background=8B5CF6&color=fff&size=64",
              }}
              style={styles.historyAvatar}
            />
            <Text style={styles.historyText}>Lịch sử</Text>
            <ChevronDown
              size={14}
              color="rgba(255,255,255,0.5)"
              style={styles.historyChevron}
            />
          </View>
        </View>

        {/* ── Feed items (old moments in same viewfinder frame) ── */}
        {feedMoments.length > 0 && (
          <View style={styles.feedSection}>
            <Text style={styles.feedSectionTitle}>Khoảnh khắc gần đây</Text>

            {feedMoments.map((item) => {
              const isMine = item.userId === userProfile?.userId;
              return (
                <View key={item.id} style={styles.feedItem}>
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.feedItemImage}
                    resizeMode="cover"
                  />
                  {/* Gradient overlay */}
                  <LinearGradient
                    colors={["transparent", "rgba(0,0,0,0.7)"]}
                    style={styles.feedItemOverlay}
                  >
                    <View style={styles.feedItemUserRow}>
                      <Image
                        source={{
                          uri:
                            item.avatarUrl ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              item.fullName?.charAt(0) || "U"
                            )}&background=8B5CF6&color=fff&size=64`,
                        }}
                        style={styles.feedItemAvatar}
                      />
                      <Text style={styles.feedItemName} numberOfLines={1}>
                        {item.fullName}
                      </Text>
                      <Text style={styles.feedItemTime}>
                        {formatTimeAgo(item.createdAt)}
                      </Text>
                    </View>
                    {item.caption ? (
                      <Text style={styles.feedItemCaption} numberOfLines={2}>
                        {item.caption}
                      </Text>
                    ) : null}
                  </LinearGradient>

                  {/* Action buttons (top-right on image) */}
                  <View style={styles.feedItemActions}>
                    <TouchableOpacity
                      style={styles.feedItemAction}
                      onPress={() =>
                        handleGoToLocation(item.latitude, item.longitude)
                      }
                    >
                      <Navigation size={16} color="#fff" strokeWidth={2} />
                    </TouchableOpacity>
                    {isMine && (
                      <TouchableOpacity
                        style={[
                          styles.feedItemAction,
                          { backgroundColor: "rgba(239,68,68,0.4)" },
                        ]}
                        onPress={() => handleDelete(item.id)}
                      >
                        <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}

            {feedLoading && (
              <View style={styles.emptyFeed}>
                <ActivityIndicator size="small" color="#FBBF24" />
              </View>
            )}

            {!feedLoading && feedMoments.length === 0 && (
              <View style={styles.emptyFeed}>
                <Text style={styles.emptyFeedText}>
                  Chưa có khoảnh khắc nào
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Bottom padding */}
        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {/* ── LOADING OVERLAY ── */}
      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FBBF24" />
          <Text style={styles.loadingText}>Đang đăng khoảnh khắc...</Text>
        </View>
      )}
    </View>
  );
};
