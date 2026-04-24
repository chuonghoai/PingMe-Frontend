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

  const getStatusText = () => {
    if (status === "connecting") return "Đang kết nối...";
    if (status === "ringing") return "Đang đổ chuông...";
    if (status === "rejected") return "Đã từ chối cuộc gọi";
    if (status === "ended") {
      if (callDuration > 0) return `Cuộc gọi đã kết thúc \u2022 ${formattedDuration}`;
      return "Cuộc gọi đã kết thúc";
    };
    if (status === "busy") return "Người dùng đang bận";
    return formattedDuration;
  };

  if (isIncoming && (status === "ringing" || status === "rejected")) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" />

        <View style={[styles.infoContainer, { top: "25%" }]}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarBig} />
          <Text style={styles.nameText}>{fullname}</Text>
          <Text style={styles.statusText}>
            {status === "rejected"
              ? "Đã từ chối cuộc gọi"
              : (isVideoCall ? "Cuộc gọi Video đến" : "Cuộc gọi Thoại đến")}
          </Text>
        </View>

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

  const isAccepted = status === "accepted";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

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

      {(!isVideoCall || !isAccepted) && (
        <View style={styles.infoContainer}>
          <Image source={{ uri: avatarUrl }} style={styles.avatarBig} />
          <Text style={styles.nameText}>{fullname}</Text>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>
      )}

      {isVideoCall && isAccepted && (
        <View style={{ position: 'absolute', top: 60, left: 20, zIndex: 10 }}>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3 }}>
            {fullname}
          </Text>
          <Text style={{ color: '#fff' }}>{getStatusText()}</Text>
        </View>
      )}
      {renderLocalCamera()}

      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={[styles.controlBtn, !isMicOn && styles.controlBtnActive]}
          onPress={toggleMic}
        >
          {isMicOn ? <Mic size={24} color={COLORS.white} /> : <MicOff size={24} color={COLORS.background} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.controlBtn, !isSpeakerOn && styles.controlBtnActive]}
          onPress={toggleSpeaker}
        >
          {isSpeakerOn ? <Volume2 size={24} color={COLORS.white} /> : <VolumeX size={24} color={COLORS.background} />}
        </TouchableOpacity>

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

        <TouchableOpacity style={styles.dangerBtn} onPress={endCall}>
          <PhoneOff size={28} color={COLORS.white} />
        </TouchableOpacity>
      </View>

    </View>
  );
};