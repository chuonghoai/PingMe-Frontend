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

import { chatApi } from "@/src/services/chatApi";
import { useUser } from "@/src/store/UserContext";
import { socketService } from "@/src/websockets/socketService"; // Import Socket Service
import { COLORS, styles } from "./ChatRoomScreen.styles";

export const ChatRoomScreen = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams(); // id là conversationId
  const { userProfile } = useUser();

  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
      // Tìm tin nhắn tạm (dựa vào temporaryId) và thay thế bằng data thật từ Backend
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.temporaryId ? { ...data, isTemporary: false } : msg,
        ),
      );
    };

    const handleMessageError = (data: any) => {
      Alert.alert("Lỗi", "Lỗi mạng, vui lòng kiểm tra lại.");
      // Xóa tin nhắn tạm khỏi danh sách vì gửi thất bại
      setMessages((prev) => prev.filter((msg) => msg.id !== data.temporaryId));
    };

    const handleNewMessage = (data: any) => {
      // Kiểm tra xem tin nhắn tới có đúng thuộc phòng chat hiện tại không
      if (data.conversationId === id) {
        setMessages((prev) => [data, ...prev]);
      }
    };

    socketService.on("message_sent_success", handleMessageSuccess);
    socketService.on("exception", handleMessageError);
    socketService.on("message_error", handleMessageError);
    socketService.on("new_message", handleNewMessage);

    return () => {
      socketService.off("message_sent_success", handleMessageSuccess);
      socketService.off("exception", handleMessageError);
      socketService.off("message_error", handleMessageError);
      socketService.off("new_message", handleNewMessage);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [id]);

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
    const isMe = item.sender?.id === userProfile?.userId;

    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={[styles.messageText, isMe ? styles.myMessageText : {}]}>
          {item.content}
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
            onChangeText={handleTextChange} // GỌI HÀM MỚI Ở ĐÂY
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
