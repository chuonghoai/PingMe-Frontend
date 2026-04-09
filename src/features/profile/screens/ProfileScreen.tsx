import { authApi } from "@/services/authApi";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  Activity,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  User,
} from "lucide-react-native";
import { useUser } from "@/store/UserContext";
import { clearTokens, getRefreshToken } from "@/utils/tokenStorage";
import { COLORS, styles } from "./ProfileScreen.styles";
import { getFriendList } from "@/services/friendsApi";

export const ProfileScreen = () => {
  const router = useRouter();
  const { userProfile, logout } = useUser();
  const [friendCount, setFriendCount] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        const res: any = await getFriendList();
        if (res.success && res.data) {
          setFriendCount(res.data.length);
        }
      } catch (error) {
        console.log("Lỗi load bạn bè:", error);
      }
    };
    loadData();
  }, []);

  const handleLogout = async () => {
    try {
      const refreshToken = (await getRefreshToken()) || "";

      if (refreshToken) {
        authApi.logout(refreshToken).catch((err) => {
          console.log("Loi thu hoi token ngam:", err);
        });
      }

      await clearTokens();

      logout();
      router.replace("/(auth)/login");
    } catch (error) {
      console.error("Lỗi đăng xuất:", error);
      router.replace("/(auth)/login");
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBackground} />

      <View style={styles.profileContent}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: userProfile.avatarUrl || "https://i.pravatar.cc/300",
            }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.name}>
          {userProfile.firstName} {userProfile.lastName}
        </Text>
        <Text style={styles.bioValue}>
          {userProfile.bio || "Chưa có tiểu sử. Hãy thêm một vài điều thú vị về bạn nhé!"}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{friendCount}</Text>
          <Text style={styles.statLabel}>Bạn bè</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProfile.currentExp}</Text>
          <Text style={styles.statLabel}>Kinh nghiệm</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{userProfile.level}</Text>
          <Text style={styles.statLabel}>Cấp độ</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Hồ sơ cá nhân</Text>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <User size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Họ và tên</Text>
            <Text style={styles.infoValue}>
              {userProfile.firstName} {userProfile.lastName}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Mail size={20} color={COLORS.primary} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Email liên hệ</Text>
            <Text style={styles.infoValue}>{userProfile.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <MapPin size={20} color={COLORS.accent} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Khu vực</Text>
            <Text style={styles.infoValue}>{userProfile.address || "Trái Đất"}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.8}
        onPress={() => alert("Chuyển sang màn hình Thống kê")}
      >
        <Activity size={20} color={COLORS.white} />
        <Text style={styles.actionBtnText}>Xem Thống Kê Hoạt Động</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          {
            backgroundColor: COLORS.bgWhite,
            borderColor: COLORS.secondary,
            borderWidth: 2,
            elevation: 0,
            shadowOpacity: 0,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => alert("Mo form sua firstName, lastName, bio")}
      >
        <Edit3 size={20} color={COLORS.secondary} />
        <Text style={[styles.actionBtnText, { color: COLORS.secondary }]}>
          Chỉnh sửa hồ sơ
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutBtn}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <LogOut size={20} color={COLORS.danger} />
        <Text style={styles.logoutBtnText}>Đăng xuất</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
