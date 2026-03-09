import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useChat } from "../hooks/ChatContext";

// Nạp Styles từ file bên ngoài vào
import { styles } from "./ChatListScreen.styles";

export const ChatListScreen = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  const { chatList } = useChat();

  const filteredChatList = chatList.filter((chat: any) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.chatItem}
      activeOpacity={0.7}
      onPress={() =>
        router.push({
          pathname: "/(main)/chat/[id]" as any,
          params: { id: item.id, name: item.name },
        })
      }
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
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

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* KHU VỰC SEARCH & ADD FRIEND */}
      <View style={styles.headerContainer}>
        <View style={styles.searchRow}>
          {/* Thanh tìm kiếm */}
          <View style={styles.searchInputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm bạn bè..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Nút Add Friend (+) */}
          <TouchableOpacity
            style={styles.addFriendBtn}
            activeOpacity={0.8}
            onPress={() => alert("Chuyển sang màn hình Tìm kiếm / Kết bạn")}
          >
            <Text style={styles.addFriendIcon}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* DANH SÁCH CHAT */}
      <FlatList
        data={filteredChatList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingVertical: 8 }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Không tìm thấy cuộc trò chuyện nào
            </Text>
          </View>
        }
      />
    </KeyboardAvoidingView>
  );
};
