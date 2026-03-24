import { CameraView, PermissionStatus, useCameraPermissions } from 'expo-camera';
import { AlertTriangle, Mic, MicOff, Phone, PhoneOff, SwitchCamera, Video, VideoOff } from "lucide-react-native";
import React, { useEffect } from "react";
import { ActivityIndicator, Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useCallController } from "../hooks/useCallController";
import { COLORS, styles } from "./CallScreen.styles";

export const CallScreen = () => {
  const {
    callData,
    status,
    isMicOn,
    isCamOn,
    isFrontCam,
    toggleMic,
    toggleCam,
    switchCamera,
    acceptCall,
    rejectCall,
    endCall,
  } = useCallController();
  const { fullname, avatarUrl, isVideoCall, isIncoming } = callData;

  const [permission, requestPermission] = useCameraPermissions();
  useEffect(() => {
    if (isVideoCall) {
      requestPermission();
    }
  }, [isVideoCall]);

  // Render text trạng thái
  const getStatusText = () => {
    if (status === "connecting") return "Đang kết nối...";
    if (status === "ringing") return "Đang đổ chuông...";
    if (status === "rejected") return "Đã từ chối cuộc gọi";
    if (status === "ended") return "Cuộc gọi đã kết thúc";
    return "00:00"; // Đồng hồ đếm giờ khi đã accepted
  };

  // 1. GIAO DIỆN NGƯỜI NHẬN - LÚC ĐANG ĐỔ CHUÔNG
  if (isIncoming && (status === "ringing" || status === "rejected")) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={[styles.infoContainer, { top: "25%" }]}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarBig} />
          <Text style={styles.nameText}>{fullname}</Text>
          <Text style={styles.statusText}>
            {/* Đổi text nếu trạng thái là rejected */}
            {status === "rejected"
              ? "Đã từ chối cuộc gọi"
              : (isVideoCall ? "Cuộc gọi Video đến" : "Cuộc gọi Thoại đến")}
          </Text>
        </View>

        {/* Chỉ hiện 2 nút Chấp nhận/Từ chối khi đang đổ chuông */}
        {status === "ringing" && (
          <View style={styles.controlsContainer}>
            <View style={{ alignItems: "center" }}>
              <TouchableOpacity style={styles.dangerBtn} onPress={rejectCall}>
                <PhoneOff size={30} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.callActionText}>Từ chối</Text>
            </View>

            <View style={{ alignItems: "center" }}>
              <TouchableOpacity style={styles.successBtn} onPress={acceptCall}>
                <Phone size={30} color={COLORS.white} />
              </TouchableOpacity>
              <Text style={styles.callActionText}>Chấp nhận</Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const renderLocalCamera = () => {
    // 4. KIỂM TRA ĐIỀU KIỆN ĐỂ BẬT CAM: VideoCall VÀ isCamOn phải TRUE
    if (!isVideoCall || !isCamOn) return null;

    // 5. XỬ LÝ CÁC TRẠNG THÁI QUYỀN (PERMISSION)
    if (!permission) {
      // Đang loading quyền
      return (
        <View style={styles.localVideoPlaceholder}>
          <ActivityIndicator size="small" color={COLORS.white} />
        </View>
      );
    }

    if (permission.status !== PermissionStatus.GRANTED) {
      // Quyền bị từ chối
      return (
        <TouchableOpacity onPress={requestPermission} style={[styles.localVideoPlaceholder, { backgroundColor: COLORS.danger + '40' }]}>
          <AlertTriangle size={24} color={COLORS.white} />
          <Text style={{ color: '#fff', fontSize: 10, marginTop: 4 }}>Cấp quyền</Text>
        </TouchableOpacity>
      );
    }

    // 6. RENDER CAMERA THẬT (sử dụng CameraView thay vì Camera)
    return (
      <View style={styles.localVideoPlaceholder}>
        <CameraView
          style={StyleSheet.absoluteFill}
          facing={isFrontCam ? 'front' : 'back'}
        />
        {/* Text debug (có thể xóa đi sau khi test xong) */}
        {/* <Text style={[styles.localCamText, {position: 'absolute', bottom: 5}]}>{isFrontCam ? "Cam trước" : "Cam sau"}</Text> */}
      </View>
    );
  };

  // 2. GIAO DIỆN KHI GỌI / ĐÃ NGHE MÁY
  const isAccepted = status === "accepted";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* BACKGROUND VIDEO (Đối phương) - Chỉ hiện khi Video Call VÀ đã Accept */}
      {isVideoCall && isAccepted && (
        <View style={styles.remoteVideoPlaceholder}>
          {/* Tương lai sẽ thay bằng <RTCView streamURL={remoteStream.toURL()} objectFit="cover" style={styles.absoluteFill} /> */}
          <Text style={{ color: '#fff' }}>[Camera của đối phương]</Text>
        </View>
      )}

      {/* THÔNG TIN NGƯỜI GỌI (Avatar, Tên) */}
      {/* Ẩn Avatar to đi nếu là Video Call và đã nhấc máy (nhường chỗ cho màn hình cam) */}
      {(!isVideoCall || !isAccepted) && (
        <View style={styles.infoContainer}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarBig} />
          <Text style={styles.nameText}>{fullname}</Text>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      )}

      {/* THÊM TÊN/THỜI GIAN NHỎ GÓC TRÊN KHI ĐANG CALL VIDEO (Đã nhấc máy) */}
      {isVideoCall && isAccepted && (
        <View style={{ position: 'absolute', top: 60, left: 20, zIndex: 10 }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3 }}>
            {fullname}
          </Text>
          <Text style={{ color: '#fff' }}>{getStatusText()}</Text>
        </View>
      )}
      {renderLocalCamera()}

      {/* CÁC NÚT ĐIỀU KHIỂN */}
      <View style={styles.controlsContainer}>
        {/* Nút Mic */}
        <TouchableOpacity
          style={[styles.controlBtn, !isMicOn && styles.controlBtnActive]}
          onPress={toggleMic}
        >
          {isMicOn ? <Mic size={24} color={COLORS.white} /> : <MicOff size={24} color={COLORS.background} />}
        </TouchableOpacity>

        {/* Nút Video / Xoay Camera (Chỉ hiện khi gọi Video) */}
        {isVideoCall && (
          <>
            <TouchableOpacity
              style={[styles.controlBtn, !isCamOn && styles.controlBtnActive]}
              onPress={toggleCam}
            >
              {isCamOn ? <Video size={24} color={COLORS.white} /> : <VideoOff size={24} color={COLORS.background} />}
            </TouchableOpacity>

            <TouchableOpacity style={styles.controlBtn} onPress={switchCamera}>
              <SwitchCamera size={24} color={COLORS.white} />
            </TouchableOpacity>
          </>
        )}

        {/* Nút Kết Thúc Cuộc Gọi */}
        <TouchableOpacity style={styles.dangerBtn} onPress={endCall}>
          <PhoneOff size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

    </View>
  );
};