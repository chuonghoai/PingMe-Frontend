import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { ChevronLeft, Bell, Check, X, UserPlus, Users, Shield, MapPin, Camera, Heart, Hand, Trophy, Sparkles, Trash2 } from "lucide-react-native";
import { Swipeable, GestureHandlerRootView } from "react-native-gesture-handler";
import { apiClient } from "@/services/apiClient";
import { respondFriendRequest } from "@/services/friendsApi";
import { socketService } from "@/websockets/socketService";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const COLORS = {
  background: "#FFF8F0",
  white: "#FFFFFF",
  primary: "#FF8C42",
  primaryLight: "rgba(255, 140, 66, 0.08)",
  purple: "#6C5CE7",
  purpleLight: "rgba(108, 92, 231, 0.08)",
  green: "#00B894",
  greenLight: "rgba(0, 184, 148, 0.08)",
  red: "#E74C3C",
  textMain: "#1A1A2E",
  textSub: "#6B7280",
  border: "#F3F0EB",
  unread: "#FFF0E6",
  gold: "#FFD700",
  goldLight: "rgba(255, 215, 0, 0.15)",
  pink: "#FF6B81",
  pinkLight: "rgba(255, 107, 129, 0.1)",
};

interface NotificationItem {
  id: string;
  type: string;
  subType: string;
  title: string;
  message: string;
  metadata: any;
  isRead: boolean;
  createdAt: string;
}

export const NotificationScreen = () => {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [respondingIds, setRespondingIds] = useState<Set<string>>(new Set());

  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      const response: any = await apiClient.get("/notifications");
      
      // Format data properly mapping notificationId to id if needed
      let fetchedData = [];
      if (Array.isArray(response)) {
        fetchedData = response;
      } else if (response.success && response.data) {
        fetchedData = response.data;
      }
      
      const formattedData = fetchedData.map((item: any) => ({
        ...item,
        id: item.id || item.notificationId,
      }));
      
      setNotifications(formattedData);
    } catch (error) {
      console.error("Lỗi khi tải thông báo:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Listen for new notifications in real-time
    const handleNewNotification = (data: any) => {
      const newItem = {
        ...data,
        id: data.id || data.notificationId, // Map WS payload to match entity structure
      };
      
      setNotifications((prev) => {
        // Prevent duplicate keys if already fetched by API
        if (prev.some(n => n.id === newItem.id)) return prev;
        return [newItem, ...prev];
      });
    };
    socketService.on("new_notification", handleNewNotification);

    return () => {
      socketService.off("new_notification", handleNewNotification);
    };
  }, []);

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await apiClient.patch(`/notifications/${notificationId}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error("Lỗi đánh dấu đã đọc:", err);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      // Optimistic update
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const response = await apiClient.delete(`/notifications/${notificationId}`);
      console.log("Xoa xog!", response);
    } catch (err: any) {
      console.error("Lỗi xoá thông báo:", err);
      alert("Lỗi xoá thông báo: " + JSON.stringify(err));
      // Revert if error
      fetchNotifications();
    }
  };

  const handleNotificationPress = (item: NotificationItem) => {
    if (!item.isRead) {
      markAsRead(item.id);
    }
    
    // Xử lý điều hướng
    if (item.subType === "MOMENT_NEW" || item.subType === "MOMENT_REACTION") {
      router.push({
        pathname: "/(main)/home",
        params: { showMomentFeed: "true", targetMomentId: item.metadata?.momentId }
      });
    } else if (item.subType === "PROXIMITY_MEETUP") {
      router.push("/(main)/home");
    } else if (item.subType === "NUDGE_RECEIVED") {
      // Tương lai có thể mở hộp thoại chat
      router.push("/(main)/home");
    }
  };

  // Handle friend request response inline
  const handleFriendRespond = async (
    requestId: string,
    action: "ACCEPT" | "REJECT",
    notificationId: string
  ) => {
    if (!requestId) {
      alert("Thông báo này đã cũ hoặc bị lỗi dữ liệu, không thể thao tác.");
      return;
    }
    try {
      setRespondingIds((prev) => new Set(prev).add(notificationId));
      const res: any = await respondFriendRequest(requestId, action);
      if (res.success) {
        // Persist responded state to backend
        try {
          await apiClient.patch(`/notifications/${notificationId}/responded`, { action });
        } catch (e) {
          console.log("Failed to persist notification response state:", e);
        }

        // Update notification locally to show result
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId
              ? {
                  ...n,
                  isRead: true,
                  metadata: {
                    ...n.metadata,
                    responded: true,
                    action: action,
                  },
                }
              : n
          )
        );
      }
    } catch (err) {
      console.error("Lỗi phản hồi lời mời:", err);
    } finally {
      setRespondingIds((prev) => {
        const next = new Set(prev);
        next.delete(notificationId);
        return next;
      });
    }
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return "Vừa xong";
    if (diffMinutes < 60) return `${diffMinutes} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const getNotificationIcon = (type: string, subType: string) => {
    if (subType === "FRIEND_REQUEST") return <UserPlus size={20} color={COLORS.purple} />;
    if (subType === "FRIEND_ACCEPTED") return <Users size={20} color={COLORS.green} />;
    if (subType === "SECURITY_ALERT") return <Shield size={20} color={COLORS.red} />;
    if (subType === "MOMENT_NEW") return <Camera size={20} color={COLORS.primary} />;
    if (subType === "MOMENT_REACTION") return <Heart size={20} color={COLORS.red} />;
    if (subType === "PROXIMITY_MEETUP") return <Sparkles size={20} color={COLORS.pink} />;
    if (subType === "NUDGE_RECEIVED") return <Hand size={20} color={COLORS.purple} />;
    if (subType === "INTIMACY_LEVEL_UP") return <Trophy size={20} color={COLORS.gold} />;
    if (type === "LOCATION") return <MapPin size={20} color={COLORS.primary} />;
    return <Bell size={20} color={COLORS.textSub} />;
  };

  const getIconBgColor = (type: string, subType: string) => {
    if (subType === "FRIEND_REQUEST") return COLORS.purpleLight;
    if (subType === "FRIEND_ACCEPTED") return COLORS.greenLight;
    if (subType === "SECURITY_ALERT") return "rgba(231, 76, 60, 0.1)";
    if (subType === "MOMENT_NEW") return COLORS.primaryLight;
    if (subType === "MOMENT_REACTION") return "rgba(231, 76, 60, 0.1)";
    if (subType === "PROXIMITY_MEETUP") return COLORS.pinkLight;
    if (subType === "NUDGE_RECEIVED") return COLORS.purpleLight;
    if (subType === "INTIMACY_LEVEL_UP") return COLORS.goldLight;
    if (type === "LOCATION") return COLORS.primaryLight;
    return COLORS.primaryLight;
  };

  const renderRightActions = (notificationId: string) => {
    return (
      <TouchableOpacity
        style={notifStyles.deleteAction}
        onPress={() => deleteNotification(notificationId)}
      >
        <Trash2 size={24} color="#FFF" />
      </TouchableOpacity>
    );
  };

  const renderNotification = ({ item }: { item: NotificationItem }) => {
    const isFriendRequest = item.subType === "FRIEND_REQUEST";
    const hasResponded = item.metadata?.responded;
    const isResponding = respondingIds.has(item.id);

    return (
      <Swipeable renderRightActions={() => renderRightActions(item.id)}>
        <TouchableOpacity
          style={[
            notifStyles.notifItem,
            !item.isRead && notifStyles.notifItemUnread,
          ]}
          onPress={() => handleNotificationPress(item)}
          activeOpacity={0.7}
        >
        {/* Icon */}
        <View style={[notifStyles.iconContainer, { backgroundColor: getIconBgColor(item.type, item.subType) }]}>
          {getNotificationIcon(item.type, item.subType)}
        </View>

        {/* Content */}
        <View style={notifStyles.contentContainer}>
          <Text style={notifStyles.titleText}>{item.title}</Text>
          <Text style={notifStyles.messageText} numberOfLines={2}>
            {item.message}
          </Text>
          {(item.subType === "MOMENT_NEW" || item.subType === "MOMENT_REACTION") && (
            <Text style={{ fontSize: 12, color: COLORS.primary, marginTop: 2, fontWeight: '500' }}>
              Bấm để xem ngay
            </Text>
          )}
          <Text style={notifStyles.timeText}>{formatTime(item.createdAt)}</Text>

          {/* Friend request actions */}
          {isFriendRequest && !hasResponded && item.metadata?.actorId && (
            <View style={notifStyles.actionRow}>
              {isResponding ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <>
                  <TouchableOpacity
                    style={notifStyles.acceptBtn}
                    onPress={() =>
                      handleFriendRespond(
                        item.metadata?.requestId || item.id,
                        "ACCEPT",
                        item.id
                      )
                    }
                  >
                    <Check size={16} color="#fff" />
                    <Text style={notifStyles.acceptText}>Chấp nhận</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={notifStyles.rejectBtn}
                    onPress={() =>
                      handleFriendRespond(
                        item.metadata?.requestId || item.id,
                        "REJECT",
                        item.id
                      )
                    }
                  >
                    <X size={16} color={COLORS.red} />
                    <Text style={notifStyles.rejectText}>Từ chối</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* Responded state */}
          {isFriendRequest && hasResponded && (
            <Text style={[notifStyles.respondedText, { color: item.metadata?.action === "ACCEPT" ? COLORS.green : COLORS.textSub }]}>
              {item.metadata?.action === "ACCEPT" ? "✓ Đã chấp nhận" : "Đã từ chối"}
            </Text>
          )}
        </View>

        {/* Unread dot */}
        {!item.isRead && <View style={notifStyles.unreadDot} />}
        </TouchableOpacity>
      </Swipeable>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={notifStyles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View style={notifStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={notifStyles.backBtn}>
          <ChevronLeft size={28} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={notifStyles.headerTitle}>Thông báo</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      {isLoading && notifications.length === 0 ? (
        <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item, index) => item?.id?.toString() || `fallback-${index}`}
          renderItem={renderNotification}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={notifStyles.emptyContainer}>
              <Bell size={48} color={COLORS.textSub} />
              <Text style={notifStyles.emptyText}>Chưa có thông báo nào</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchNotifications}
              colors={[COLORS.primary]}
            />
          }
        />
      )}
      </View>
    </GestureHandlerRootView>
  );
};

const notifStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
  },
  notifItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  notifItemUnread: {
    backgroundColor: COLORS.unread,
  },
  iconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  contentContainer: {
    flex: 1,
  },
  titleText: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMain,
    marginBottom: 2,
  },
  messageText: {
    fontSize: 13,
    color: COLORS.textSub,
    lineHeight: 18,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 11,
    color: COLORS.textSub,
    opacity: 0.7,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 8,
    gap: 8,
  },
  acceptBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    gap: 4,
  },
  acceptText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  rejectBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 4,
  },
  rejectText: {
    fontSize: 12,
    fontWeight: "600",
    color: COLORS.textSub,
  },
  respondedText: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 6,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
    marginTop: 6,
    marginLeft: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 80,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.textSub,
  },
  deleteAction: {
    backgroundColor: COLORS.red,
    justifyContent: "center",
    alignItems: "center",
    width: 80,
    height: "100%",
  },
});
