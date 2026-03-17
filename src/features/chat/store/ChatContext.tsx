import { chatApi } from "@/src/services/chatApi";
import { useUser } from "@/src/store/UserContext";
import React, { createContext, useContext, useEffect, useState } from "react";

export const ChatContext = createContext<any>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const { userProfile } = useUser();

  // Lấy danh sách conversations từ API
  const loadConversations = async () => {
    try {
      setIsLoadingConversations(true);
      const response: any = await chatApi.getConversations();

      if (response.success) {
        setConversations(response.data);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách hội thoại:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  useEffect(() => {
    if (userProfile?.userId) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [userProfile?.userId]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        isLoadingConversations,
        loadConversations,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
