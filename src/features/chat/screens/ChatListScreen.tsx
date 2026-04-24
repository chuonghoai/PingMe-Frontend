import { useUser } from "@/store/UserContext";
import { Stack, useRouter } from "expo-router";
import { Search } from "lucide-react-native";
import React, { useContext, useState, useEffect } from "react";
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
import { chatApi } from "@/services/chatApi";

export const ChatListScreen = () => {
  const router = useRouter();

  const handleClose = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/(main)/home");
    }
  };

  const {
    conversations,
    isLoadingConversations,
    loadConversations,
    onlineUsers,
  } = useContext(ChatContext);
  const { userProfile } = useUser();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{conversations: any[], messages: any[]}>({ conversations: [], messages: [] });

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults({ conversations: [], messages: [] });
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res: any = await chatApi.searchConversations(searchQuery);
        if (res.success && res.data) {
          setSearchResults(res.data);
        }
      } catch (err) {
        console.error("Search error", err);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

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

    const isOnline = onlineUsers.includes(otherParticipant?.userId);

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() =>
          router.push({
            pathname: "/(main)/chat/[id]",
            params: {
              id: item.id,
              name: displayName,
              targetUserId: otherParticipant?.userId,
              avatarUrl: encodeURIComponent(otherParticipant?.user?.avatarUrl || otherParticipant?.avatarUrl || "https://ui-avatars.com/api/?name=User")
            },
          })
        }
      >
        <View style={styles.avatarContainer}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />

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
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
        </View>

        {searchQuery.trim() ? (
          isSearching ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
              style={{ marginTop: 40 }}
            />
          ) : (
            <FlatList
              data={[
                ...(searchResults.conversations.length > 0 ? [{ isHeader: true, title: "Hội thoại" }] : []),
                ...searchResults.conversations.map(c => ({ ...c, isConversation: true })),
                ...(searchResults.messages.length > 0 ? [{ isHeader: true, title: "Tin nhắn" }] : []),
                ...searchResults.messages.map(m => ({ ...m, isMessage: true }))
              ]}
              keyExtractor={(item, index) => item.id || `header-${index}`}
              renderItem={({ item }) => {
                if (item.isHeader) {
                  return <Text style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8, fontSize: 14, fontWeight: "bold", color: COLORS.textSub }}>{item.title}</Text>;
                }
                if (item.isConversation) {
                  return renderItem({ item });
                }
                if (item.isMessage) {
                  return (
                    <TouchableOpacity
                      style={styles.chatItem}
                      onPress={() =>
                        router.push({
                          pathname: "/(main)/chat/[id]",
                          params: {
                            id: item.conversationId,
                            name: item.displayName,
                            targetUserId: item.targetUserId,
                            avatarUrl: encodeURIComponent(item.displayAvatar || "https://ui-avatars.com/api/?name=User")
                          },
                        })
                      }
                    >
                      <View style={styles.avatarContainer}>
                        <Image source={{ uri: item.displayAvatar || "https://ui-avatars.com/api/?name=User" }} style={styles.avatar} />
                      </View>
                      <View style={styles.chatInfo}>
                        <View style={styles.chatHeader}>
                          <Text style={styles.chatName} numberOfLines={1}>{item.displayName}</Text>
                          <Text style={styles.chatTime}>{formatTime(item.createdAt)}</Text>
                        </View>
                        <View style={styles.chatFooter}>
                          <Text style={styles.lastMessage} numberOfLines={2}>
                            {item.senderId === userProfile?.userId ? "Bạn: " : `${item.senderName}: `}
                            {item.content}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                }
                return null;
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>Không tìm thấy kết quả nào cho "{searchQuery}".</Text>
                </View>
              }
            />
          )
        ) : (
          isLoadingConversations && conversations?.length === 0 ? (
            <ActivityIndicator
              size="large"
              color={COLORS.primary}
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
                  colors={[COLORS.primary]}
                />
              }
            />
          )
        )}
      </View>
    </View>
  );
};
