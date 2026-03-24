import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import {
  ChevronLeft,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useChat } from "../store/ChatContext";
import { chatApi } from "@/src/services/chatApi";
import { useUser } from "@/src/store/UserContext";
import { socketService } from "@/src/websockets/socketService";
import { COLORS, styles } from "./ChatRoomScreen.styles";

export const ChatRoomScreen = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const { userProfile } = useUser();
  const { clearUnreadCount } = useChat();

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOtherTyping, setIsOtherTyping] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  // Ref quản lý trạng thái typing
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  const flatListRef = useRef<FlatList>(null);

  // Animated Value cho cụm Media
  const mediaWidthAnim = useRef(new Animated.Value(100)).current;
  const mediaOpacityAnim = useRef(new Animated.Value(1)).current;

  // 1. TẢI LỊCH SỬ TIN NHẮN
  useEffect(() => {
    if (id) {
      fetchMessages();
      socketService.emit("mark_read", { conversationId: id });
      clearUnreadCount(id as string);
    }
  }, [id]);

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      const response: any = await chatApi.getMessages(id as string, 1, 20);
      if (response.success) {
        setMessages(response.data.messages);
      }
    } catch (error) {
      console.error("Lỗi khi tải lịch sử chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. LẮNG NGHE PHẢN HỒI GỬI TIN NHẮN TỪ SOCKET
  useEffect(() => {
    const handleMessageSuccess = (data: any) => {
      const realMessage = data.message || data;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.temporaryId
            ? { ...msg, ...realMessage, isTemporary: false, isRead: false }
            : msg,
        ),
      );
    };

    const handleMessageError = (data: any) => {
      showMessage("Loi", "Loi mang, vui long kiem tra lai.");
      // Xóa tin nhắn tạm khỏi danh sách vì gửi thất bại
      setMessages((prev) => prev.filter((msg) => msg.id !== data.temporaryId));
    };

    const handleNewMessage = (data: any) => {
      const realMessage = data.message || data;
      const messageSenderId = realMessage.sender?.id || realMessage.senderId;
      if (messageSenderId === userProfile?.userId) return;

      if (realMessage.conversationId === id) {
        setMessages((prev) => [realMessage, ...prev]);
        socketService.emit("mark_read", { conversationId: id });
        clearUnreadCount(id as string);
      }
    };

    const handleMessagesRead = (data: any) => {
      if (data.conversationId === id) {
        setMessages((prev) => prev.map((msg) => {
          const senderId = msg.sender?.id || msg.senderId;
          if (senderId === userProfile?.userId) {
            return { ...msg, isRead: true };
          }
          return msg;
        }));
      }
    };

    const handleIsTyping = (data: { conversationId: string; userId: string; isTyping: boolean }) => {
      if (data.conversationId === id && data.userId !== userProfile?.userId) {
        setIsOtherTyping(data.isTyping);
      }
    };

    socketService.on("is_typing", handleIsTyping);
    socketService.on("message_sent_success", handleMessageSuccess);
    socketService.on("exception", handleMessageError);
    socketService.on("message_error", handleMessageError);
    socketService.on("new_message", handleNewMessage);
    socketService.on("messages_read", handleMessagesRead);

    return () => {
      socketService.off("is_typing", handleIsTyping);
      socketService.off("message_sent_success", handleMessageSuccess);
      socketService.off("exception", handleMessageError);
      socketService.off("message_error", handleMessageError);
      socketService.off("new_message", handleNewMessage);
      socketService.off("messages_read", handleMessagesRead);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [id, userProfile]);

  // 3. HIỆU ỨNG UX & LOGIC TYPING
  const handleTextChange = (text: string) => {
    setInputText(text);

    // Xử lý hiệu ứng co giãn nút Media
    if (text.length > 0) {
      Animated.parallel([
        Animated.timing(mediaWidthAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: false,
        }),
        Animated.timing(mediaOpacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(mediaWidthAnim, {
          toValue: 90,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(mediaOpacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start();
    }

    // Logic bắn event typing
    if (!isTyping) {
      setIsTyping(true);
      socketService.emit("typing", { conversationId: id, isTyping: true });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // NẾu sau 3 giây không gõ nữa -> Bắn event ngừng typing
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socketService.emit("typing", { conversationId: id, isTyping: false });
    }, 3000);
  };

  // 4. XỬ LÝ GỬI TIN NHẮN (Optimistic UI)
  const handleSend = () => {
    if (inputText.trim()) {
      const tempId = `temp_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      const textToSend = inputText.trim();

      // 4.1. Tạo tin nhắn tạm (Gắn cờ isTemporary)
      const tempMessage = {
        id: tempId,
        content: textToSend,
        sender: { id: userProfile?.userId },
        createdAt: new Date().toISOString(),
        isTemporary: true,
      };

      // 4.2. Render ngay lập tức lên màn hình
      setMessages((prev) => [tempMessage, ...prev]);
      setInputText("");

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      setIsTyping(false);
      socketService.emit("typing", { conversationId: id, isTyping: false });

      // 4.4. Bắn event lên Backend
      socketService.emit("send_message", {
        conversationId: id,
        content: textToSend,
        type: "TEXT",
        temporaryId: tempId,
        // mediaId: ...,
        // replyToId: ...
      });
    }
  };

  const formatTime = (isoString: string) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
  };

  const renderMessage = ({ item }: { item: any }) => {
    const messageSenderId =
      item.sender?.id || item.senderId || item.sender?.userId;
    const isMe = messageSenderId === userProfile?.userId;
    const displayContent = item.content || item.message?.content || "";

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={[styles.messageText, isMe ? styles.myMessageText : {}]}>
          {displayContent}
        </Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: isMe ? "flex-end" : "flex-start",
            marginTop: 4,
          }}
        >
          <Text
            style={[
              styles.timeText,
              isMe ? styles.myTimeText : styles.theirTimeText,
            ]}
          >
            {formatTime(item.createdAt)}
          </Text>

          {/* HIỆN SPINNER XOAY TRÒN NẾU ĐANG LÀ TIN NHẮN TẠM (Chờ server phản hồi) */}
          {item.isTemporary && (
            <ActivityIndicator
              size="small"
              color={COLORS.white}
              style={{ marginLeft: 6 }}
            />
          )}

          {isMe && !item.isTemporary && (
            <Text style={{ marginLeft: 6, color: COLORS.white, fontSize: 10, alignSelf: 'center', opacity: 0.8 }}>
              {item.isRead ? "✓✓" : "✓"}
            </Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER --- */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color={COLORS.amberGold} />
        </TouchableOpacity>

        <Image
          source={{ uri: "https://i.pravatar.cc/150?img=11" }}
          style={styles.headerAvatar}
        />

        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerName} numberOfLines={1}>
            {name || "Người dùng"}
          </Text>
          <View style={styles.headerStatusContainer}>
            <View style={styles.statusDot} />
            <Text style={styles.headerStatus}>Đang hoạt động</Text>
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Phone size={22} color={COLORS.amberGold} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <MoreVertical size={22} color={COLORS.iconGray} />
          </TouchableOpacity>
        </View>
      </View>

      {/* --- DANH SÁCH TIN NHẮN --- */}
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color={COLORS.amberGold} />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item, index) =>
            item?.id ? item.id.toString() : index.toString()
          }
          renderItem={renderMessage}
          contentContainerStyle={styles.chatListContent}
          ref={flatListRef}
          inverted
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* --- TYPING --- */}
      {isOtherTyping && (
        <View style={{ paddingHorizontal: 16, paddingBottom: 8, backgroundColor: COLORS.lightYellow }}>
          <Text style={{ fontSize: 12, color: COLORS.textSub, fontStyle: "italic" }}>
            {name || "Người dùng"} đang soạn tin...
          </Text>
        </View>
      )}

      {/* --- THANH NHẬP LIỆU --- */}
      <View style={styles.inputContainer}>
        <Animated.View
          style={[
            styles.mediaButtonsContainer,
            { width: mediaWidthAnim, opacity: mediaOpacityAnim },
          ]}
        >
          <TouchableOpacity style={styles.mediaButton}>
            <ImageIcon size={24} color={COLORS.iconGray} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.mediaButton}>
            <Video size={24} color={COLORS.iconGray} />
          </TouchableOpacity>
        </Animated.View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChangeText={handleTextChange}
            placeholderTextColor={COLORS.textSub}
            multiline
          />
          <TouchableOpacity style={styles.stickerButton}>
            <Smile size={24} color={COLORS.iconGray} />
          </TouchableOpacity>
        </View>

        {inputText.trim().length > 0 && (
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={24} color={COLORS.amberGold} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};
