import { useRouter } from "expo-router";
import { useEffect, useState } from "react";

// --- MOCK DATA ---
const MOCK_DATA = {
  id: "user_999",
  fullname: "Nguyễn Văn Test",
  avatarUrl: "https://i.pravatar.cc/300?img=11",
  isVideoCall: true,
  isIncoming: true,
};

export type CallStatus = "connecting" | "ringing" | "accepted" | "rejected" | "ended";

export const useCallController = () => {
  const router = useRouter();

  const [callData] = useState(MOCK_DATA);
  const [status, setStatus] = useState<CallStatus>(
    callData.isIncoming ? "ringing" : "connecting"
  );

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);
  const [isFrontCam, setIsFrontCam] = useState(true);

  // 1. Logic giả lập các trạng thái kết nối
  useEffect(() => {
    if (!callData.isIncoming && status === "connecting") {
      const timer = setTimeout(() => setStatus("ringing"), 2000);
      return () => clearTimeout(timer);
    }

    if (!callData.isIncoming && status === "ringing") {
      // Tự động từ chối sau 5s đổ chuông để test
      const timer = setTimeout(() => setStatus("accepted"), 5000);
      return () => clearTimeout(timer);
    }
  }, [callData.isIncoming, status]);

  // 2. Logic TỰ ĐỘNG THOÁT khi cuộc gọi bị từ chối hoặc kết thúc
  useEffect(() => {
    if (status === "rejected" || status === "ended") {
      const timer = setTimeout(() => {
        if (router.canGoBack()) {
          router.back();
        }
      }, 1500); // Sau 1.5s sẽ tự động đóng màn hình

      // Cleanup function để tránh lỗi unmounted component
      return () => clearTimeout(timer);
    }
  }, [status, router]);

  // --- CÁC HÀM TƯƠNG TÁC GIAO DIỆN ---
  const toggleMic = () => setIsMicOn(!isMicOn);
  const toggleCam = () => setIsCamOn(!isCamOn);
  const switchCamera = () => setIsFrontCam(!isFrontCam);

  const acceptCall = () => setStatus("accepted");

  // Bây giờ các hàm này chỉ cần đổi status, phần thoát màn hình đã có useEffect ở trên lo
  const rejectCall = () => setStatus("rejected");
  const endCall = () => setStatus("ended");

  return {
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
  };
};