import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useChat } from "../hooks/ChatContext";

// Nạp Styles từ file bên ngoài vào
import { styles } from "./ChatRoomScreen.styles";

export const ChatRoomScreen = () => {
  const router = useRouter();
  const { id, name } = useLocalSearchParams();
  const [inputText, setInputText] = useState("");

  // Khai báo flatListRef bằng hook useRef Ở TRONG component
  const flatListRef = useRef<FlatList>(null);

  const { messagesStore, sendMessage } = useChat();
  const currentMessages = messagesStore[id as string] || [];

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(id as string, inputText);
      setInputText("");
    }
  };

  // Mock các hành động bấm nút tiện ích (chưa có logic)
  const handlePickImage = () => alert("Tính năng gửi ảnh đang phát triển!");
  const handlePickVideo = () => alert("Tính năng gửi video đang phát triển!");
  const handleOpenStickers = () => alert("Tính năng Sticker đang phát triển!");

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
        <Text style={[styles.timeText, isMe ? styles.myTimeText : {}]}>
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
      {/* ---TẮT HEADER CỦA EXPO ROUTER --- */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* --- HEADER CUSTOM CỦA CHÚNG TA --- */}
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Text style={styles.backIconChar}>{"‹"}</Text>
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerName} numberOfLines={1}>
            {name || "Người dùng"}
          </Text>
          <Text style={styles.headerStatus}>Đang hoạt động</Text>
        </View>
      </View>

      {/* --- DANH SÁCH TIN NHẮN --- */}
      <FlatList
        data={currentMessages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatListContent}
        // Gọi ref chuẩn chỉ
        ref={flatListRef}
        onContentSizeChange={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
        }
        onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
      />

      {/* --- THANH NHẬP LIỆU --- */}
      <View style={styles.inputContainer}>
        <View style={styles.mediaButtonsContainer}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handlePickImage}
          >
            <Text style={styles.mediaIconChar}>🖼️</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handlePickVideo}
          >
            <Text style={styles.mediaIconChar}>🎥</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.textInput}
            placeholder="Nhập tin nhắn..."
            value={inputText}
            onChangeText={setInputText}
            placeholderTextColor="#999"
            multiline
          />
          <TouchableOpacity
            style={styles.stickerButton}
            onPress={handleOpenStickers}
          >
            <Text style={styles.stickerIconChar}>☺︎</Text>
          </TouchableOpacity>
        </View>

        {/* Chỉ hiện nút gửi khi có text */}
        {inputText.trim().length > 0 && (
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>Gửi</Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};
