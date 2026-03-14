import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
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
// Import các icon chuẩn mực từ Lucide
import {
  ChevronLeft,
  Image as ImageIcon,
  MoreVertical,
  Phone,
  Send,
  Smile,
  Video,
} from "lucide-react-native";
import { useChat } from "../store/ChatContext";
import { COLORS, styles } from "./ChatRoomScreen.styles";

export const ChatRoomScreen = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const [inputText, setInputText] = useState("");

  const flatListRef = useRef<FlatList>(null);
  const { messagesStore, sendMessage } = useChat();
  const currentMessages = messagesStore[id as string] || [];

  // Khởi tạo Animated Value cho cụm Media (Ảnh/Video)
  const mediaWidthAnim = useRef(new Animated.Value(100)).current;
  const mediaOpacityAnim = useRef(new Animated.Value(1)).current;

  // Hiệu ứng UX: Ẩn nút Ảnh/Video khi bắt đầu gõ phím
  useEffect(() => {
    if (inputText.length > 0) {
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
          toValue: 90, // Chiều rộng gốc của 2 nút
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
  }, [inputText]);

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(id as string, inputText);
      setInputText("");
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.sender === "me";
    return (
      <View
        style={[
          styles.messageBubble,
          isMe ? styles.myMessage : styles.theirMessage,
        ]}
      >
        <Text style={[styles.messageText, isMe ? styles.myMessageText : {}]}>
          {item.text}
        </Text>
        <Text
          style={[
            styles.timeText,
            isMe ? styles.myTimeText : styles.theirTimeText,
          ]}
        >
          {item.time}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER CUSTOM HIỆN ĐẠI --- */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <ChevronLeft size={28} color={COLORS.amberGold} />
        </TouchableOpacity>

        {/* Giả lập Avatar người chat cùng */}
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

        {/* Các nút gọi điện, cài đặt */}
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
      <FlatList
        data={currentMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatListContent}
        ref={flatListRef}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* --- THANH NHẬP LIỆU CÓ HIỆU ỨNG --- */}
      <View style={styles.inputContainer}>
        {/* Cụm Media có thể co lại mượt mà */}
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
            onChangeText={setInputText}
            placeholderTextColor={COLORS.textSub}
            multiline
          />
          <TouchableOpacity style={styles.stickerButton}>
            <Smile size={24} color={COLORS.iconGray} />
          </TouchableOpacity>
        </View>

        {/* Chỉ hiện nút Gửi (icon giấy bay) khi có text */}
        {inputText.trim().length > 0 && (
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Send size={24} color={COLORS.amberGold} />
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};
