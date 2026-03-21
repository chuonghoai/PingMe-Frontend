import { chatApi } from "@/src/services/chatApi";
import { useUser } from "@/src/store/UserContext";
import { socketService } from "@/src/websockets/socketService";
import React, { createContext, useContext, useEffect, useState } from "react";

export const ChatContext = createContext<any>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
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
    // Nếu chưa đăng nhập -> Xóa sạch data
    if (!userProfile?.userId) {
      setConversations([]);
      setOnlineUsers([]);
      setIsLoadingConversations(false);
      return;
    }

    // Tải danh sách chat
    loadConversations();

    // Sự kiện ai đó online
    const handleUserOnline = (data: { userId: string }) => {
      console.log("🔥 Ai đó vừa online:", data.userId);
      setOnlineUsers((prev) => {
        if (prev.includes(data.userId)) return prev;
        return [...prev, data.userId];
      });
    };

    // Sự kiện ai đó offline
    const handleUserOffline = (data: { userId: string; lastActiveAt: any }) => {
      console.log("💤 Ai đó vừa offline:", data.userId);
      setOnlineUsers((prev) => prev.filter((id) => id !== data.userId));
    };

    const handleOnlineUsersList = (users: string[]) => {
      console.log("👥 Nhận danh sách online tổng:", users);
      setOnlineUsers(users);
    };

    const handleSyncChatList = () => {
      loadConversations();
    };

    socketService.on("user_online", handleUserOnline);
    socketService.on("user_offline", handleUserOffline);
    socketService.on("online_users_list", handleOnlineUsersList);
    socketService.on("new_message", handleSyncChatList);
    socketService.on("message_sent_success", handleSyncChatList);

    // Dọn dẹp listener khi đăng xuất
    return () => {
      socketService.off("user_online", handleUserOnline);
      socketService.off("user_offline", handleUserOffline);
      socketService.off("online_users_list", handleOnlineUsersList);
      socketService.on("new_message", handleSyncChatList);
      socketService.on("message_sent_success", handleSyncChatList);
    };
  }, [userProfile?.userId]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        isLoadingConversations,
        loadConversations,
        onlineUsers,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
