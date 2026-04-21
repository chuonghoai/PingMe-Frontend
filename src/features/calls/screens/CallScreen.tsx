import { useCameraPermissions } from 'expo-camera';
import { Mic, MicOff, Phone, PhoneOff, SwitchCamera, Video, VideoOff, Volume2, VolumeX } from "lucide-react-native";
import React, { useEffect } from "react";
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { RTCView } from "react-native-webrtc";
import { useCallController } from "../hooks/useCallController";
import { COLORS, styles } from "./CallScreen.styles";

export const CallScreen = () => {
  const {
    callData,
    status,
    isMicOn,
    isCamOn,
    isFrontCam,
    formattedDuration,
    callDuration,
    isSpeakerOn,
    localStream,
    remoteStream,
    toggleMic,
    toggleCam,
    switchCamera,
    toggleSpeaker,
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
    if (status === "ended") {
      if (callDuration > 0) return `Cuộc gọi đã kết thúc \u2022 ${formattedDuration}`;
      return "Cuộc gọi đã kết thúc";
    }
    if (status === "busy") return "Người dùng đang bận";
    return formattedDuration;
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
    if (!isVideoCall || !isCamOn || !localStream) return null;

    return (
      <View style={styles.localVideoPlaceholder}>
        <RTCView
          streamURL={localStream.toURL()}
          objectFit="cover"
          style={StyleSheet.absoluteFill}
          mirror={isFrontCam}
          zOrder={1}
        />
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
          {remoteStream ? (
            <RTCView
              key={remoteStream.toURL()}
              streamURL={remoteStream.toURL()}
              objectFit="cover"
              style={StyleSheet.absoluteFill}
              zOrder={0}
            />
          ) : (
            <Text style={{ color: '#fff' }}>Đang kết nối video...</Text>
          )}
        </View>
      )}

      {/* THÔNG TIN NGƯỜI GỌI (Avatar, Tên) */}
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

        {/* Nút Speaker */}
        <TouchableOpacity
          style={[styles.controlBtn, !isSpeakerOn && styles.controlBtnActive]}
          onPress={toggleSpeaker}
        >
          {isSpeakerOn ? <Volume2 size={24} color={COLORS.white} /> : <VolumeX size={24} color={COLORS.background} />}
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