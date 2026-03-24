import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import InCallManager from "react-native-incall-manager";
import {
  mediaDevices,
  MediaStream,
  RTCIceCandidate,
  RTCPeerConnection,
  RTCSessionDescription,
} from "react-native-webrtc";
import { socketService } from "../../../websockets/socketService";

export type CallStatus = "connecting" | "ringing" | "accepted" | "rejected" | "ended";

// Cấu hình máy chủ STUN miễn phí của Google để tìm đường kết nối mạng
const peerConstraints = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export const useCallController = () => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const targetUserId = params.targetUserId as string;
  const isVideoCall = params.isVideoCall === "true";
  const isIncoming = params.isIncoming === "true";
  const fullname = (params.fullname as string) || "Người dùng";
  const avatarUrl = (params.avatarUrl as string) || "https://ui-avatars.com/api/?name=User";
  console.log(`Đang gọi đến ${targetUserId}`);

  const [callData] = useState({ id: targetUserId, fullname, avatarUrl, isVideoCall, isIncoming });
  const [status, setStatus] = useState<CallStatus>(isIncoming ? "ringing" : "connecting");
  const [callDuration, setCallDuration] = useState(0);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isFrontCam, setIsFrontCam] = useState(true);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);

  const pc = useRef<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const hasEmittedCall = useRef(false);
  const pendingCandidates = useRef<any[]>([]);

  // Calculate call duration
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (status === "accepted") {
      interval = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [status]);

  const formattedDuration = `${String(Math.floor(callDuration / 60)).padStart(2, "0")}:${String(
    callDuration % 60
  ).padStart(2, "0")}`;

  // Create camera/mic and webRTC when enter call screen
  useEffect(() => {
    let isMounted = true;

    // Bật VoIP audio mode + speaker ngay khi vào màn hình gọi
    InCallManager.start({ media: isVideoCall ? 'video' : 'audio' });
    InCallManager.setForceSpeakerphoneOn(true);

    const setupWebrtc = async () => {
      try {
        const stream = await mediaDevices.getUserMedia({
          audio: true,
          video: isVideoCall ? { facingMode: isFrontCam ? "user" : "environment" } : false,
        });
        if (isMounted) setLocalStream(stream);

        const peerConnection = new RTCPeerConnection(peerConstraints);

        stream.getTracks().forEach((track) => {
          peerConnection.addTrack(track, stream);
        });

        (peerConnection as any).addEventListener('track', (event: any) => {
          if (event.streams && event.streams[0]) {
            setRemoteStream(event.streams[0]);
          }
        });

        (peerConnection as any).addEventListener('icecandidate', (event: any) => {
          if (event.candidate) {
            socketService.emit("webrtc_ice_candidate", {
              targetUserId,
              candidate: event.candidate,
            });
          }
        });

        pc.current = peerConnection;

        // BẢO VỆ CHẶT: Chỉ phát sự kiện gọi 1 lần duy nhất
        if (!isIncoming && status === "connecting" && !hasEmittedCall.current) {
          hasEmittedCall.current = true;
          console.log(`[Caller] Đã gửi tín hiệu gọi đến ${targetUserId}`);
          socketService.emit("call_user", { targetUserId, isVideoCall });
          setStatus("ringing");
        }
      } catch (error) {
        console.error("Lỗi truy cập thiết bị:", error);
      }
    };

    setupWebrtc();

    return () => {
      isMounted = false;
      if (localStream) localStream.getTracks().forEach((t) => t.stop());
      if (pc.current) pc.current.close();
      InCallManager.stop();
    };
  }, []); // <--- Giữ nguyên array rỗng

  // 2. XỬ LÝ CÁC SỰ KIỆN SIGNALING TỪ SOCKET
  useEffect(() => {
    // ❌ ĐÃ XÓA DÒNG `if (!pc.current) return;` GÂY LỖI Ở ĐÂY ❌

    const handleCallResponse = async (data: { responderId: string; accepted: boolean }) => {
      
      if (data.accepted) {
        setStatus("accepted");
        try {
          if (pc.current) { // Check bên trong hàm thay vì check bên ngoài
            const offer = await pc.current.createOffer();
            await pc.current.setLocalDescription(offer);
            socketService.emit("webrtc_offer", { targetUserId, sdp: offer });
          }
        } catch (err) {
          console.error("Lỗi tạo Offer:", err);
        }
      } else {
        setStatus("rejected");
      }
    };

    const handleWebrtcOffer = async (data: { senderId: string; sdp: any }) => {
      if (data.senderId !== targetUserId) return;
      try {
        if (pc.current) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          const answer = await pc.current.createAnswer();
          await pc.current.setLocalDescription(answer);
          socketService.emit("webrtc_answer", { targetUserId, sdp: answer });

          // Xử lý hàng đợi candidate xếp hàng trước khi có remoteDescription
          for (const c of pendingCandidates.current) {
            await pc.current.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidates.current = [];
        }
      } catch (err) {
        console.error("Lỗi xử lý Offer:", err);
      }
    };

    const handleWebrtcAnswer = async (data: { senderId: string; sdp: any }) => {
      if (data.senderId !== targetUserId) return;
      try {
        if (pc.current) {
          await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
          
          // Xử lý hàng đợi candidate
          for (const c of pendingCandidates.current) {
            await pc.current.addIceCandidate(new RTCIceCandidate(c));
          }
          pendingCandidates.current = [];
        }
      } catch (err) {
        console.error("Lỗi xử lý Answer:", err);
      }
    };

    const handleIceCandidate = async (data: { senderId: string; candidate: any }) => {
      if (data.senderId !== targetUserId) return;
      try {
        if (pc.current) {
          if (pc.current.remoteDescription) {
            await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
          } else {
            pendingCandidates.current.push(data.candidate);
          }
        }
      } catch (err) {
        console.error("Lỗi thêm ICE Candidate:", err);
      }
    };

    const handleCallEnded = () => {
      console.log("Đối phương đã cúp máy.");
      setStatus("ended");
    };

    const handleCallError = (data: any) => {
      console.log("Lỗi:", data?.message);
      setStatus("ended");
    };

    // Luôn luôn đăng ký lắng nghe dù WebRTC đã khởi tạo xong hay chưa
    socketService.on("call_response_received", handleCallResponse);
    socketService.on("webrtc_offer_received", handleWebrtcOffer);
    socketService.on("webrtc_answer_received", handleWebrtcAnswer);
    socketService.on("webrtc_ice_candidate_received", handleIceCandidate);
    socketService.on("call_ended", handleCallEnded);
    socketService.on("call_error", handleCallError);

    return () => {
      socketService.off("call_response_received", handleCallResponse);
      socketService.off("webrtc_offer_received", handleWebrtcOffer);
      socketService.off("webrtc_answer_received", handleWebrtcAnswer);
      socketService.off("webrtc_ice_candidate_received", handleIceCandidate);
      socketService.off("call_ended", handleCallEnded);
      socketService.off("call_error", handleCallError);
    };
  }, [targetUserId]);

  // 3. LOGIC TỰ ĐỘNG THOÁT
  useEffect(() => {
    if (status === "rejected" || status === "ended") {
      const timer = setTimeout(() => {
        if (router.canGoBack()) router.back();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  // --- CÁC HÀM TƯƠNG TÁC GIAO DIỆN CHUẨN WEBRTC ---

  const toggleMic = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !isMicOn; // Tắt/bật luồng âm thanh
      });
    }
    setIsMicOn(!isMicOn);
  };

  const toggleCam = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !isCamOn; // Tắt/bật luồng hình ảnh
      });
    }
    setIsCamOn(!isCamOn);
  };

  const switchCamera = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track: any) => {
        // Hàm _switchCamera là API nội bộ của thư viện react-native-webrtc để đảo cam
        track._switchCamera();
      });
    }
    setIsFrontCam(!isFrontCam);
  };

  const toggleSpeaker = () => {
    const next = !isSpeakerOn;
    InCallManager.setForceSpeakerphoneOn(next);
    setIsSpeakerOn(next);
  };

  const acceptCall = () => {
    setStatus("accepted");
    socketService.emit("call_response", { targetUserId, accepted: true });
  };

  const rejectCall = () => {
    setStatus("rejected");
    socketService.emit("call_response", { targetUserId, accepted: false });
  };

  const endCall = () => {
    setStatus("ended");
    socketService.emit("end_call", { targetUserId });
  };

  return {
    callData,
    status,
    isMicOn,
    isCamOn,
    isFrontCam,
    isSpeakerOn,
    formattedDuration,
    localStream,
    remoteStream,
    toggleMic,
    toggleCam,
    switchCamera,
    toggleSpeaker,
    acceptCall,
    rejectCall,
    endCall,
  };
};