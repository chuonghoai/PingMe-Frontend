import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import {
  ChevronRight,
  ImageIcon,
  RefreshCw,
  RotateCcw,
  Send,
  X,
} from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { mediaApi } from "@/services/mediaApi";
import { momentsApi } from "@/services/momentsApi";
import { useUser } from "@/store/UserContext";
import { momentCameraStyles as styles } from "./MomentCameraScreen.styles";

interface MomentCameraScreenProps {
  onClose: () => void;
  onOpenGlobalFeed: () => void;
  onMomentCreated?: () => void;
  onNavigateToLocation?: (lat: number, lng: number) => void;
}

export const MomentCameraScreen = ({
  onClose,
  onOpenGlobalFeed,
  onMomentCreated,
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

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Lỗi", "Vui lòng cấp quyền truy cập vị trí");
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      setCurrentLocation(coords);
      return coords;
    } catch (error) {
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại");
      return null;
    }
  };

  const takePhoto = useCallback(async () => {
    if (!permission?.granted) {
      const res = await requestPermission();
      if (!res.granted) return Alert.alert("Lỗi", "Vui lòng cấp quyền Camera");
    }
    
    try {
      if (cameraRef.current) {
        setIsCapturing(true);
        const result = await cameraRef.current.takePictureAsync({ quality: 0.5, base64: true });
        if (result?.uri) {
          setPhotoUri(result.uri);
          setPreviewBase64(result.base64 ? `data:image/jpeg;base64,${result.base64}` : result.uri);
          getCurrentLocation();
        }
        setIsCapturing(false);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể chụp ảnh");
      setIsCapturing(false);
    }
  }, [permission]);

  const pickFromGallery = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Lỗi", "Vui lòng cấp quyền thư viện ảnh");

    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPreviewBase64(result.assets[0].uri);
      getCurrentLocation();
    }
  }, []);

  const postMoment = useCallback(async () => {
    if (!photoUri) return;
    try {
      setIsUploading(true);
      let location = currentLocation || await getCurrentLocation();
      if (!location) return setIsUploading(false);

      const signatureData = await mediaApi.getSignature();
      const cloudinaryResult = await mediaApi.uploadToCloudinary(photoUri, signatureData, "image", "image/jpeg");
      await mediaApi.createMediaRecord(cloudinaryResult);

      await momentsApi.createMoment({
        imageUrl: cloudinaryResult.secure_url,
        caption: caption.trim() || undefined,
        latitude: location.latitude,
        longitude: location.longitude,
      });

      Alert.alert("Thành công", "Khoảnh khắc đã được ghim lên bản đồ! 📍");
      onMomentCreated?.();
      onClose();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể đăng khoảnh khắc.");
    } finally {
      setIsUploading(false);
    }
  }, [photoUri, caption, currentLocation]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={[styles.closeBtn, { top: insets.top + 8 }]} onPress={onClose}>
        <X size={22} color="#fff" strokeWidth={2.5} />
      </TouchableOpacity>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: insets.top + 16 }} showsVerticalScrollIndicator={false}>
        <View style={styles.viewfinderSection}>
          <View style={styles.viewfinderFrame}>
            {photoUri ? (
              <View style={styles.viewfinderImage}>
                <Image source={{ uri: previewBase64 || photoUri }} style={{ width: "100%", height: "100%" }} />
                <View style={styles.captionOverlay}>
                  <TextInput
                    style={styles.captionInput}
                    placeholder="Viết caption..."
                    placeholderTextColor="rgba(255,255,255,0.5)"
                    value={caption}
                    onChangeText={setCaption}
                    multiline
                  />
                </View>
              </View>
            ) : (
              <CameraView style={styles.viewfinderImage} facing={facing} ref={cameraRef} />
            )}
          </View>
        </View>

        <View style={styles.controlsContainer}>
          <View style={styles.controlsRow}>
            {!photoUri ? (
              <>
                <TouchableOpacity style={styles.galleryBtn} onPress={pickFromGallery}>
                  <ImageIcon size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.captureBtn} onPress={takePhoto} disabled={isCapturing}>
                  <View style={styles.captureBtnInner} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.flipBtn} onPress={toggleCameraFacing}>
                  <RefreshCw size={20} color="#fff" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity style={styles.retakeBtn} onPress={() => setPhotoUri(null)}>
                  <RotateCcw size={20} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.postBtn} onPress={postMoment} disabled={isUploading}>
                  <Send size={24} color="#000" />
                </TouchableOpacity>
                <View style={{ width: 48 }} />
              </>
            )}
          </View>
        </View>

        <TouchableOpacity style={styles.historySection} onPress={onOpenGlobalFeed}>
          <View style={styles.historyRow}>
            <Image
              source={{ uri: userProfile?.avatarUrl || "https://ui-avatars.com/api/?name=U" }}
              style={styles.historyAvatar}
            />
            <Text style={styles.historyText}>Xem tất cả khoảnh khắc</Text>
            <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
          </View>
        </TouchableOpacity>

        <View style={{ height: insets.bottom + 20 }} />
      </ScrollView>

      {isUploading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FBBF24" />
          <Text style={styles.loadingText}>Đang đăng khoảnh khắc...</Text>
        </View>
      )}
    </View>
  );
};