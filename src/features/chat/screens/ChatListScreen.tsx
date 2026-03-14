import { Stack, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  PanResponder, // <-- Import thêm PanResponder để bắt sự kiện vuốt
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
// Đã xóa nút X khỏi danh sách import
import { MessageSquareOff, Search, UserPlus } from "lucide-react-native";
import { useChat } from "../store/ChatContext";

import { COLORS, styles } from "./ChatListScreen.styles";

export const ChatListScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { chatList } = useChat();

  const filteredChatList = chatList.filter((chat: any) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // --- CẢM BIẾN VUỐT (SWIPE TO DISMISS) ---
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Chỉ kích hoạt cảm biến khi người dùng vuốt theo chiều dọc (tránh nhầm lẫn với vuốt ngang)
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Nếu ngón tay kéo xuống dưới hơn 50px -> Đóng màn hình
        if (gestureState.dy > 50) {
          router.back();
        }
      },
    }),
  ).current;

  const renderItem = ({ item, index }: { item: any; index: number }) => {
    const isOnline = item.unread > 0 || index % 3 === 0;

    return (
      <TouchableOpacity
        style={styles.chatItem}
        activeOpacity={0.6}
        onPress={() =>
          router.push({
            pathname: "/(main)/chat/[id]" as any,
            params: { id: item.id, name: item.name },
          })
        }
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
          {isOnline && <View style={styles.onlineBadge} />}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.chatTime}>{item.time}</Text>
          </View>
          <View style={styles.chatFooter}>
            <Text
              style={[
                styles.lastMessage,
                item.unread > 0 && styles.unreadMessage,
              ]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>
            {item.unread > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>{item.unread}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.overlay}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Nền đen mờ bấm vào sẽ đóng Chat */}
      <TouchableOpacity
        style={StyleSheet.absoluteFill}
        activeOpacity={1}
        onPress={() => router.back()}
      />

      {/* Cửa sổ Chat (Bottom Sheet) */}
      <KeyboardAvoidingView
        style={styles.bottomSheet}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Thanh kéo nhỏ (Đã gắn cảm biến vuốt panHandlers) */}
        <View style={styles.dragHandleContainer} {...panResponder.panHandlers}>
          <View style={styles.dragHandle} />
        </View>

        {/* KHU VỰC SEARCH & ADD FRIEND */}
        <View style={styles.headerContainer}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <View style={styles.searchIcon}>
                <Search size={20} color={COLORS.textSub} />
              </View>
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm bạn bè..."
                placeholderTextColor={COLORS.textSub}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <TouchableOpacity
              style={styles.addFriendBtn}
              activeOpacity={0.8}
              onPress={() => alert("Chuyển sang màn hình Tìm kiếm / Kết bạn")}
            >
              <UserPlus size={22} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* DANH SÁCH CHAT */}
        <FlatList
          style={{ flex: 1 }}
          data={filteredChatList}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingVertical: 8, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MessageSquareOff size={48} color={COLORS.borderColor} />
              <Text style={styles.emptyText}>
                Không tìm thấy cuộc trò chuyện nào
              </Text>
            </View>
          }
        />
      </KeyboardAvoidingView>
    </View>
  );
};
