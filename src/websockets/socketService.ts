import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";
import { BASE_URL } from "../services/apiClient";

class SocketService {
  public socket: Socket;

  constructor() {
    // 1. Khởi tạo socket ngay từ đầu để UI có thể gắn listener (.on)
    // nhưng đặt autoConnect: false để nó không tự tiện kết nối khi chưa có Token
    this.socket = io(BASE_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("🟢 [Socket] Đã kết nối thành công, ID:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔴 [Socket] Đã ngắt kết nối. Lý do:", reason);
    });
  }

  public async connect() {
    if (this.socket.connected) return;

    let token = null;
    if (Platform.OS === "web") {
      token = localStorage.getItem("accessToken");
    } else {
      token = await SecureStore.getItemAsync("accessToken");
    }

    if (!token) return;

    // 2. Gắn token vào và chủ động mở kết nối
    this.socket.auth = { token };
    this.socket.connect();
  }

  public disconnect() {
    if (this.socket.connected) {
      this.socket.disconnect();
    }
  }

  public emit(eventName: string, data: any) {
    this.socket.emit(eventName, data);
  }

  public on(eventName: string, callback: (data: any) => void) {
    this.socket.on(eventName, callback);
  }

  public off(eventName: string, callback?: (data: any) => void) {
    this.socket.off(eventName, callback);
  }
}

export const socketService = new SocketService();
