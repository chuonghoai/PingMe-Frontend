import { BASE_URL } from "@/services/apiClient";
import { getAccessToken } from "@/utils/tokenStorage";
import { io, Socket } from "socket.io-client";

class SocketService {
  public socket: Socket;

  constructor() {
    this.socket = io(BASE_URL, {
      autoConnect: false,
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("[Socket] Da ket noi thanh cong, ID:", this.socket.id);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("[Socket] Da ngat ket noi. Ly do:", reason);
    });
  }

  public async connect() {
    if (this.socket.connected) return;

    const token = await getAccessToken();
    if (!token) return;

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
