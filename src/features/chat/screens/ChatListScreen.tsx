import { useUser } from "@/src/store/UserContext"; // Lấy UserContext để biết "Mình là ai"
import { Stack, useRouter } from "expo-router"; // Thêm Stack
import { Search, UserPlus } from "lucide-react-native";
import React, { useContext } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { ChatContext } from "../store/ChatContext";
import { COLORS, styles } from "./ChatListScreen.styles";

export const ChatListScreen = () => {
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(main)/home');
    }
  };

  const {
    conversations,
    isLoadingConversations,
    loadConversations,
    onlineUsers,
  } = useContext(ChatContext);
  const { userProfile } = useUser();

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) {
      return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
    }
    return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}`;
  };

  const renderItem = ({ item }: { item: any }) => {
    const isGroup = item.type === "GROUP";

    const otherParticipant =
      item.participants?.find((p: any) => p.userId !== userProfile?.userId) ||
      item.participants?.[0];

    const displayName = isGroup
      ? item.name
      : otherParticipant?.user?.fullname ||
        otherParticipant?.fullname ||
        "Người dùng ẩn danh";

    const displayAvatar = isGroup
      ? "https://ui-avatars.com/api/?name=Group&background=random"
      : otherParticipant?.user?.avatarUrl ||
        otherParticipant?.avatarUrl ||
        "https://ui-avatars.com/api/?name=User";

    const snippet = item.lastMessageSnippet || "Chưa có tin nhắn nào";
    const hasUnread = item.unreadCount > 0;

    // KIỂM TRA TRẠNG THÁI ONLINE
    const isOnline = onlineUsers.includes(otherParticipant?.userId);

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => router.replace(`/(main)/chat/${item.id}`)}
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />

          {/* RENDER CHẤM ONLINE/OFFLINE (Chỉ áp dụng cho Chat 1-1) */}
          {!isGroup && (
            <View
              style={[styles.onlineBadge, !isOnline && styles.offlineBadge]}
            />
          )}
        </View>

        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {displayName}
            </Text>
            <Text style={styles.chatTime}>
              {formatTime(item.lastMessageAt)}
            </Text>
          </View>

          <View style={styles.chatFooter}>
            <Text
              style={[styles.lastMessage, hasUnread && styles.unreadMessage]}
              numberOfLines={1}
            >
              {snippet}
            </Text>
            {hasUnread && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>
                  {item.unreadCount > 99 ? "99+" : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.overlay}>
      {/* TẮT HEADER MẶC ĐỊNH CỦA EXPO ROUTER */}
      <Stack.Screen options={{ headerShown: false }} />

      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={{ flex: 1 }} />
      </TouchableWithoutFeedback>

      <View style={styles.bottomSheet}>
        <View style={styles.dragHandleContainer}>
          <View style={styles.dragHandle} />
        </View>

        <View style={styles.headerContainer}>
          <View style={styles.searchRow}>
            <View style={styles.searchInputWrapper}>
              <Search
                size={20}
                color={COLORS.textSub}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Tìm kiếm"
                placeholderTextColor={COLORS.textSub}
              />
            </View>
            <TouchableOpacity style={styles.addFriendBtn}>
              <UserPlus size={20} color={COLORS.white} />
            </TouchableOpacity>
          </View>
        </View>

        {isLoadingConversations && conversations?.length === 0 ? (
          <ActivityIndicator
            size="large"
            color={COLORS.amberGold}
            style={{ marginTop: 40 }}
          />
        ) : (
          <FlatList
            data={conversations}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                  Bạn chưa có cuộc trò chuyện nào.
                </Text>
              </View>
            }
            refreshControl={
              <RefreshControl
                refreshing={isLoadingConversations}
                onRefresh={loadConversations}
                colors={[COLORS.amberGold]}
              />
            }
          />
        )}
      </View>
    </View>
  );
};
