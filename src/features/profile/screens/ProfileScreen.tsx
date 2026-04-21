import { authApi } from "@/services/authApi";
import { useRouter } from "expo-router";
import React, { useEffect, useState, useCallback } from "react";
import {
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
  Switch,
  RefreshControl,
} from "react-native";
import {
  ChevronLeft,
  ChevronRight,
  Camera,
  Edit3,
  LogOut,
  MapPin,
  User,
  Users,
  X,
  EyeOff,
  Eye,
  UserMinus,
  Calendar,
  ImageIcon,
  Settings,
} from "lucide-react-native";
import { useUser } from "@/store/UserContext";
import { clearTokens, getRefreshToken } from "@/utils/tokenStorage";
import { COLORS, styles } from "./ProfileScreen.styles";
import { getFriendList, unfriend, FriendListResponseDto } from "@/services/friendsApi";
import { apiClient } from "@/services/apiClient";

// ── Friend List Modal ──
const FriendListModal = ({
  visible,
  onClose,
  friends,
  onUnfriend,
  loadingId,
}: {
  visible: boolean;
  onClose: () => void;
  friends: FriendListResponseDto[];
  onUnfriend: (friendId: string) => void;
  loadingId: string | null;
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Bạn bè ({friends.length})</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <X size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <FlatList
            data={friends}
            keyExtractor={(item) => item.userId}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListEmptyComponent={
              <View style={{ alignItems: "center", paddingTop: 40 }}>
                <Users size={48} color={COLORS.textMuted} />
                <Text style={{ color: COLORS.textSecondary, marginTop: 12, fontSize: 15 }}>
                  Chưa có bạn bè nào
                </Text>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.friendItem}>
                <Image
                  source={{ uri: item.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
                  style={styles.friendAvatar}
                />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.friendName}>{item.fullName}</Text>
                  <Text style={styles.friendStatus}>
                    {item.onlineStatus === "ONLINE" ? "🟢 Đang hoạt động" : "⚪ Ngoại tuyến"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.unfriendBtn}
                  onPress={() => onUnfriend(item.userId)}
                  disabled={loadingId === item.userId}
                >
                  {loadingId === item.userId ? (
                    <ActivityIndicator size="small" color={COLORS.danger} />
                  ) : (
                    <UserMinus size={18} color={COLORS.danger} />
                  )}
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

// ── Edit Profile Modal ──
const EditProfileModal = ({
  visible,
  onClose,
  currentName: initialName,
  currentBio: initialBio,
  onSave,
  isSaving,
}: {
  visible: boolean;
  onClose: () => void;
  currentName: string;
  currentBio: string;
  onSave: (name: string, bio: string) => void;
  isSaving: boolean;
}) => {
  const [name, setName] = useState(initialName);
  const [bio, setBio] = useState(initialBio);

  useEffect(() => {
    setName(initialName);
    setBio(initialBio);
  }, [initialName, initialBio]);

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chỉnh sửa hồ sơ</Text>
            <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn}>
              <X size={22} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </View>

          <View style={{ padding: 20 }}>
            <Text style={styles.editLabel}>Họ và tên</Text>
            <TextInput
              style={styles.editInput}
              value={name}
              onChangeText={setName}
              placeholder="Nhập họ và tên..."
              placeholderTextColor={COLORS.textMuted}
            />

            <Text style={[styles.editLabel, { marginTop: 16 }]}>Tiểu sử</Text>
            <TextInput
              style={[styles.editInput, { height: 100, textAlignVertical: "top" }]}
              value={bio}
              onChangeText={setBio}
              placeholder="Viết gì đó về bản thân..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              maxLength={200}
            />
            <Text style={{ fontSize: 12, color: COLORS.textMuted, textAlign: "right", marginTop: 4 }}>
              {bio.length}/200
            </Text>

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && { opacity: 0.6 }]}
              onPress={() => onSave(name, bio)}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// ── Main ProfileScreen ──
export const ProfileScreen = () => {
  const router = useRouter();
  const { userProfile, updateUserProfile, logout } = useUser();

  const [friends, setFriends] = useState<FriendListResponseDto[]>([]);
  const [friendCount, setFriendCount] = useState(0);
  const [momentCount, setMomentCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modals
  const [showFriendList, setShowFriendList] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [unfriendingId, setUnfriendingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Location privacy
  const [isHidingLocation, setIsHidingLocation] = useState(userProfile.isHideMyLocation || false);

  const loadData = useCallback(async () => {
    try {
      const [friendsRes, statsRes]: any[] = await Promise.all([
        getFriendList(),
        apiClient.get("/users/me/stats"),
      ]);

      if (friendsRes.success && friendsRes.data) {
        setFriends(friendsRes.data);
        setFriendCount(friendsRes.data.length);
      }
      if (statsRes.success && statsRes.data) {
        setMomentCount(statsRes.data.momentCount || 0);
      }
    } catch (error) {
      console.log("Lỗi load profile data:", error);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setIsRefreshing(false);
  };

  const formatJoinDate = (dateString: string) => {
    if (!dateString) return "Không rõ";
    const date = new Date(dateString);
    const months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
    return `tháng ${months[date.getMonth()]}/${date.getFullYear()}`;
  };

  const handleLogout = async () => {
    try {
      const refreshToken = (await getRefreshToken()) || "";
      if (refreshToken) {
        authApi.logout(refreshToken).catch((err) => {
          console.log("Lỗi thu hồi token:", err);
        });
      }
      await clearTokens();
      logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Loi dang xuat:", error);
      router.replace("/(auth)/login");
    }
  };

  const handleUnfriend = async (friendId: string) => {
    Alert.alert(
      "Hủy kết bạn",
      "Bạn có chắc muốn hủy kết bạn với người này?",
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy kết bạn",
          style: "destructive",
          onPress: async () => {
            try {
              setUnfriendingId(friendId);
              const res: any = await unfriend(friendId);
              if (res.success) {
                setFriends((prev) => prev.filter((f) => f.userId !== friendId));
                setFriendCount((prev) => prev - 1);
              }
            } catch (err) {
              console.log("Lỗi hủy kết bạn:", err);
            } finally {
              setUnfriendingId(null);
            }
          },
        },
      ]
    );
  };

  const handleSaveProfile = async (name: string, bio: string) => {
    try {
      setIsSaving(true);
      const res: any = await apiClient.put("/users/me", {
        fullname: name,
        phone: "",
        gender: null,
        dob: "",
      });
      // Also update bio if endpoint supports it. For now we update locally.
      updateUserProfile({ firstName: name.split(" ")[0], lastName: name.split(" ").slice(1).join(" "), bio, fullname: name });
      setShowEditProfile(false);
    } catch (err) {
      console.log("Lỗi cập nhật profile:", err);
      Alert.alert("Lỗi", "Không thể cập nhật hồ sơ. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLocation = async (value: boolean) => {
    setIsHidingLocation(value);
    try {
      await apiClient.patch("/users/location-share", {
        action: value ? "STOP" : "START",
      });
      updateUserProfile({ isHideMyLocation: value });
    } catch (err) {
      console.log("Lỗi toggle location:", err);
      setIsHidingLocation(!value);
    }
  };

  const displayName = userProfile.fullname || `${userProfile.firstName} ${userProfile.lastName}`;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      <View style={styles.headerBackground} />

      {/* ── AVATAR + NAME SECTION ── */}
      <View style={styles.profileContent}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: userProfile.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
            }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.name}>{displayName}</Text>
        {userProfile.username ? (
          <Text style={styles.username}>@{userProfile.username}</Text>
        ) : null}
        <Text style={styles.bioValue}>
          {userProfile.bio || "Chưa có tiểu sử. Hãy thêm một vài điều thú vị về bạn nhé!"}
        </Text>
        {userProfile.joinAt ? (
          <View style={styles.joinDateRow}>
            <Calendar size={14} color={COLORS.textMuted} />
            <Text style={styles.joinDateText}>Tham gia từ {formatJoinDate(userProfile.joinAt)}</Text>
          </View>
        ) : null}
      </View>

      {/* ── STATS BAR ── */}
      <View style={styles.statsContainer}>
        <TouchableOpacity style={styles.statItem} onPress={() => setShowFriendList(true)}>
          <Text style={styles.statNumber}>{friendCount}</Text>
          <Text style={styles.statLabel}>Bạn bè</Text>
        </TouchableOpacity>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{momentCount}</Text>
          <Text style={styles.statLabel}>Khoảnh khắc</Text>
        </View>
      </View>

      {/* ── SETTINGS SECTION ── */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Cài đặt</Text>

        {/* Edit Profile */}
        <TouchableOpacity style={styles.settingRow} onPress={() => setShowEditProfile(true)}>
          <View style={[styles.iconBox, { backgroundColor: "rgba(255, 140, 66, 0.1)" }]}>
            <Edit3 size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.settingText}>Chỉnh sửa hồ sơ</Text>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Friends List */}
        <TouchableOpacity style={styles.settingRow} onPress={() => setShowFriendList(true)}>
          <View style={[styles.iconBox, { backgroundColor: "rgba(108, 92, 231, 0.1)" }]}>
            <Users size={20} color="#6C5CE7" />
          </View>
          <Text style={styles.settingText}>Danh sách bạn bè</Text>
          <ChevronRight size={20} color={COLORS.textMuted} />
        </TouchableOpacity>

        {/* Toggle Location */}
        <View style={styles.settingRow}>
          <View style={[styles.iconBox, { backgroundColor: isHidingLocation ? "rgba(255, 56, 96, 0.1)" : "rgba(0, 184, 148, 0.1)" }]}>
            {isHidingLocation ? (
              <EyeOff size={20} color={COLORS.danger} />
            ) : (
              <Eye size={20} color="#00B894" />
            )}
          </View>
          <Text style={[styles.settingText, { flex: 1 }]}>Ẩn vị trí của tôi</Text>
          <Switch
            value={isHidingLocation}
            onValueChange={handleToggleLocation}
            trackColor={{ false: COLORS.border, true: COLORS.primary }}
            thumbColor="#fff"
          />
        </View>
      </View>

      {/* ── DANGER ZONE ── */}
      <TouchableOpacity
        style={styles.logoutBtn}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <LogOut size={20} color={COLORS.danger} />
        <Text style={styles.logoutBtnText}>Dang xuat</Text>
      </TouchableOpacity>

      {/* ── MODALS ── */}
      <FriendListModal
        visible={showFriendList}
        onClose={() => setShowFriendList(false)}
        friends={friends}
        onUnfriend={handleUnfriend}
        loadingId={unfriendingId}
      />

      <EditProfileModal
        visible={showEditProfile}
        onClose={() => setShowEditProfile(false)}
        currentName={displayName}
        currentBio={userProfile.bio || ""}
        onSave={handleSaveProfile}
        isSaving={isSaving}
      />
    </ScrollView>
  );
};
