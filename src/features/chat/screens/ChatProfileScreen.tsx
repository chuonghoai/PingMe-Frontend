import { chatApi } from "@/services/chatApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Ban,
  BellOff,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Phone,
  Search,
  Trash2,
  User,
  Video,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useChat } from "../store/ChatContext";
import { COLORS, styles } from "./ChatProfileScreen.styles";

export const ChatProfileScreen = () => {
  const router = useRouter();
  const { conversationId, targetUserId, name, avatarUrl } = useLocalSearchParams();
  const { loadConversations } = useChat();

  const [recentMedia, setRecentMedia] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(true);

  const displayAvatar = avatarUrl ? decodeURIComponent(avatarUrl as string) : "https://ui-avatars.com/api/?name=User";
  const displayName = (name as string) || "Người dùng";

  useEffect(() => {
    if (conversationId) {
      fetchRecentMedia();
    }
  }, [conversationId]);

  const fetchRecentMedia = async () => {
    try {
      setIsLoadingMedia(true);
      // Lấy 10 media gần nhất
      const res: any = await chatApi.getConversationMedia(conversationId as string, 1, 10);
      if (res.success && res.data) {
        // Lọc loại bỏ Audio nếu API chưa lọc
        const filteredMedia = res.data.messages.filter(
          (m: any) => m.type === "IMAGE" || m.type === "VIDEO"
        );
        setRecentMedia(filteredMedia);
      }
    } catch (error) {
      console.log("Lỗi lấy media:", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleCall = (isVideo: boolean) => {
    router.push({
      pathname: "/(main)/call",
      params: {
        targetUserId,
        isVideoCall: String(isVideo),
        isIncoming: "false",
        fullname: displayName,
        avatarUrl,
      },
    });
  };

  const handleBlockUser = async () => {
    Alert.alert("Xác nhận", `Bạn có chắc chắn muốn chặn ${displayName}?`, [
      { text: "Hủy", style: "cancel" },
      { text: "Chặn", style: "destructive", onPress: async () => {
        try {
          await chatApi.blockUser(conversationId as string);
          await loadConversations();
          alert("Đã chặn người dùng");
          router.back(); // Trở về chat room
        } catch (e) { alert("Lỗi khi chặn"); }
      }}
    ]);
  };

  const handleClearHistory = async () => {
    Alert.alert("Xác nhận", "Xóa toàn bộ lịch sử trò chuyện phía bạn?", [
      { text: "Hủy", style: "cancel" },
      { text: "Xóa", style: "destructive", onPress: async () => {
          try {
            await chatApi.clearHistory(conversationId as string);
            await loadConversations();
            alert("Đã xóa lịch sử trò chuyện");
            router.back();
          } catch (e) { alert("Lỗi khi xóa"); }
      }}
    ]);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={28} color={COLORS.amberGold} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tùy chọn</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image source={{ uri: displayAvatar }} style={styles.avatar} />
          <Text style={styles.name}>{displayName}</Text>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => handleCall(false)}>
              <View style={styles.actionIconBox}>
                <Phone size={24} color={COLORS.textMain} />
              </View>
              <Text style={styles.actionText}>Gọi thoại</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => handleCall(true)}>
              <View style={styles.actionIconBox}>
                <Video size={24} color={COLORS.textMain} />
              </View>
              <Text style={styles.actionText}>Gọi video</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
              <View style={styles.actionIconBox}>
                <User size={24} color={COLORS.textMain} />
              </View>
              <Text style={styles.actionText}>Hồ sơ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Media Section */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.sectionHeader}
            onPress={() => router.push({
              pathname: "/(main)/chat-media",
              params: { conversationId }
            })}
          >
            <Text style={styles.sectionTitle}>Phương tiện, file và liên kết</Text>
            <Text style={styles.seeAllText}>Tất cả</Text>
          </TouchableOpacity>

          {isLoadingMedia ? (
            <ActivityIndicator size="small" color={COLORS.amberGold} style={{ marginVertical: 20 }} />
          ) : recentMedia.length === 0 ? (
            <Text style={{ textAlign: 'center', color: COLORS.textSub, paddingBottom: 16 }}>Chưa có file phương tiện nào</Text>
          ) : (
            <View style={styles.mediaGrid}>
              {recentMedia.slice(0, 4).map((msg, index) => (
                <View key={msg.id || index} style={styles.mediaItem}>
                  {msg.media?.secureUrl ? (
                    <Image source={{ uri: msg.media.secureUrl }} style={styles.mediaImage} />
                  ) : (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                      <ImageIcon size={24} color={COLORS.textSub} />
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Cài đặt chung */}
        <View style={styles.optionsList}>
          <TouchableOpacity style={styles.optionItem}>
            <Search size={22} color={COLORS.textMain} />
            <Text style={styles.optionText}>Tìm kiếm trong cuộc trò chuyện</Text>
            <ChevronRight size={20} color={COLORS.textSub} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <BellOff size={22} color={COLORS.textMain} />
            <Text style={styles.optionText}>Tắt thông báo</Text>
            <ChevronRight size={20} color={COLORS.textSub} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={handleBlockUser}>
            <Ban size={22} color={COLORS.errorRed} />
            <Text style={[styles.optionText, styles.dangerText]}>Chặn người dùng</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem} onPress={handleClearHistory}>
            <Trash2 size={22} color={COLORS.errorRed} />
            <Text style={[styles.optionText, styles.dangerText]}>Xóa lịch sử trò chuyện</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};