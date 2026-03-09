import { apiClient } from "./apiClient";

// --- 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU ---
export interface ChatListItem {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  avatar: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: "me" | "them"; // Để UI biết bóng chat nằm bên trái hay phải
  time: string;
}

// --- 2. GOM NHÓM CÁC HÀM GỌI API ---
export const chatApi = {
  // Lấy danh sách các cuộc trò chuyện hiển thị ở ChatListScreen
  getChatRooms: async (): Promise<ChatListItem[]> => {
    const response = await apiClient.get<ChatListItem[]>("/chats/rooms");
    return response.data;
  },

  // Lấy lịch sử tin nhắn của một phòng cụ thể (Phân trang - Pagination)
  getMessagesByRoom: async (
    roomId: string,
    page: number = 0,
    size: number = 20,
  ): Promise<ChatMessage[]> => {
    const response = await apiClient.get<ChatMessage[]>(
      `/chats/rooms/${roomId}/messages`,
      {
        params: { page, size },
      },
    );
    return response.data;
  },
};
