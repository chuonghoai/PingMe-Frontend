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
  getConversations: async () => {
    return apiClient.get("/conversations");
  },

  getMessages: async (conversationId: string, page = 1, limit = 20) => {
    return apiClient.get(
      `/messages/${conversationId}?page=${page}&limit=${limit}`,
    );
  },

  getMessageContext: async (conversationId: string, messageId: string) => {
    return apiClient.get(`/messages/${conversationId}/context/${messageId}`);
  }
};
