import { chatApi } from "@/services/chatApi";
import { useUser } from "@/store/UserContext";
import { socketService } from "@/websockets/socketService";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "expo-router";

export const ChatContext = createContext<any>(null);

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();

  const [conversations, setConversations] = useState<any[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const { userProfile } = useUser();

  // Call api get conversation list
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

  // Clear unread count
  const clearUnreadCount = (conversationId: string) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
      )
    );
  };

  useEffect(() => {
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

    const handleNewMessage = (data: any) => {
      if (data && data.conversation) {
        setConversations((prev) => {
          const currentList = [...prev];
          const rawConv = data.conversation;
          const index = currentList.findIndex(c => c.id === rawConv.id);
          if (index > -1) {
            currentList.splice(index, 1);
          }

          // Format raw entity to match UI requirements (hoist unreadCount & hasMuted)
          const myParticipant = rawConv.participants?.find((p: any) => p.userId === userProfile?.userId) || {};
          
          const formattedConv = {
            id: rawConv.id,
            type: rawConv.type,
            name: rawConv.name,
            avatarUrl: rawConv.avatarUrl,
            lastMessageSnippet: rawConv.lastMessageSnippet,
            lastMessageAt: rawConv.lastMessageAt,
            unreadCount: myParticipant.unreadCount || 0,
            hasMuted: myParticipant.hasMuted || false,
            participants: rawConv.participants?.map((op: any) => ({
              userId: op.user?.id || op.userId,
              fullname: op.user?.fullname,
              avatarUrl: op.user?.avatarUrl,
              isOnline: op.user?.isOnline || false,
            })) || []
          };

          currentList.unshift(formattedConv);
          return currentList;
        });
      } else {
        loadConversations();
      }
    };

    // Incoming call
    const handleIncomingCall = (data: any) => {
      console.log("📞 Có cuộc gọi đến:", data);
      
      router.push({
        pathname: "/(main)/call",
        params: {
          targetUserId: data.callerId,
          fullname: data.fullname,
          avatarUrl: data.avatarUrl,
          isVideoCall: String(data.isVideoCall),
          isIncoming: "true",
        },
      });
    };

    // Khi kết bạn thành công → Refresh conversation list
    const handleFriendAccepted = (data: any) => {
      console.log("🎉 Kết bạn thành công:", data);
      loadConversations(); // Refresh để hiện conversation mới
    };

    socketService.on("is_typing", (data: any) => {
      console.log("🔥 Ai đó vừa typing:", data.userId);
    })
    socketService.on("user_online", handleUserOnline);
    socketService.on("user_offline", handleUserOffline);
    socketService.on("online_users_list", handleOnlineUsersList);
    socketService.on("new_message", handleNewMessage);
    socketService.on("message_sent_success", handleSyncChatList);
    socketService.on("incoming_call", handleIncomingCall);
    socketService.on("friend_accepted", handleFriendAccepted);

    // Dọn dẹp listener khi đăng xuất
    return () => {
      socketService.off("user_online", handleUserOnline);
      socketService.off("user_offline", handleUserOffline);
      socketService.off("online_users_list", handleOnlineUsersList);
      socketService.off("new_message", handleNewMessage);
      socketService.off("message_sent_success", handleSyncChatList);
      socketService.off("incoming_call", handleIncomingCall);
      socketService.off("friend_accepted", handleFriendAccepted);
    };
  }, [userProfile?.userId]);

  // Tính tổng tin nhắn chưa đọc
  const totalUnreadCount = useMemo(() => {
    if (!conversations || conversations.length === 0) return 0;
    return conversations.reduce((sum: number, conv: any) => sum + (conv.unreadCount || 0), 0);
  }, [conversations]);

  return (
    <ChatContext.Provider
      value={{
        conversations,
        isLoadingConversations,
        loadConversations,
        onlineUsers,
        totalUnreadCount,
        clearUnreadCount,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
