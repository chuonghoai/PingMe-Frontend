import { apiClient } from "./apiClient";

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
  sender: "me" | "them";
  time: string;
}

export const chatApi = {
  getConversations: async () => {
    return apiClient.get("/conversations");
  },

  searchConversations: async (keyword: string) => {
    return apiClient.get(`/conversations/search?q=${encodeURIComponent(keyword)}`);
  },

  getMessages: async (conversationId: string, page = 1, limit = 20) => {
    return apiClient.get(
      `/messages/${conversationId}?page=${page}&limit=${limit}`,
    );
  },

  getMessageContext: async (conversationId: string, messageId: string) => {
    return apiClient.get(`/messages/${conversationId}/context/${messageId}`);
  },

  getConversationMedia: async (conversationId: string, page = 1, limit = 10) => {
    return apiClient.get(
      `/messages/${conversationId}/media?page=${page}&limit=${limit}`,
    );
  },

  blockUser: async (conversationId: string) => {
    return apiClient.post(`/conversations/${conversationId}/block`);
  },
  unblockUser: async (conversationId: string) => {
    return apiClient.post(`/conversations/${conversationId}/unblock`);
  },
  clearHistory: async (conversationId: string) => {
    return apiClient.post(`/conversations/${conversationId}/clear-history`);
  },
  muteConversation: async (conversationId: string) => {
    return apiClient.post(`/conversations/${conversationId}/mute`);
  },
  searchMessagesInChat: async (conversationId: string, keyword: string) => {
    return apiClient.get(`/messages/${conversationId}/search?q=${encodeURIComponent(keyword)}`);
  },
};
