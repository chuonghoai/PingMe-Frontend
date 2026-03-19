import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
// Import dàn Icon xịn xò
import { authApi } from "@/src/services/authApi";
import * as SecureStore from "expo-secure-store";
import {
  Activity,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  User,
} from "lucide-react-native";
import { useUser } from "../../../store/UserContext";
import { COLORS, styles } from "./ProfileScreen.styles";

export const ProfileScreen = () => {
  const router = useRouter();
  const { userProfile, logout } = useUser();

  const handleLogout = async () => {
    try {
      const refreshToken =
        Platform.OS === "web"
          ? localStorage.getItem("refreshToken") || ""
          : (await SecureStore.getItemAsync("refreshToken")) || "";

      if (refreshToken) {
        authApi.logout(refreshToken).catch((err) => {
          console.log("Lỗi thu hồi token ngầm (có thể token đã hết hạn):", err);
        });
      }

      if (Platform.OS === "web") {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } else {
        await SecureStore.deleteItemAsync("accessToken");
        await SecureStore.deleteItemAsync("refreshToken");
      }

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
      {/* 1. MẢNG MÀU CONG PHÍA SAU (Tạo hiệu ứng 3D) */}
      <View style={styles.headerBackground} />

      {/* 2. KHU VỰC AVATAR & BIO CUT-OUT */}
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
          {userProfile.bio ||
            "Chưa có tiểu sử. Hãy thêm một vài điều thú vị về bạn nhé!"}
        </Text>
      </View>

      {/* 3. THÔNG SỐ TƯƠNG TÁC (GAMIFICATION UX) */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>142</Text>
          <Text style={styles.statLabel}>Bạn bè</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>28</Text>
          <Text style={styles.statLabel}>Địa điểm</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>5🔥</Text>
          <Text style={styles.statLabel}>Chuỗi ngày</Text>
        </View>
      </View>

      {/* 4. THẺ THÔNG TIN CÁ NHÂN */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Hồ sơ cá nhân</Text>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <User size={20} color={COLORS.darkAmber} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Họ và Tên</Text>
            <Text style={styles.infoValue}>
              {userProfile.firstName} {userProfile.lastName}
            </Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <Mail size={20} color={COLORS.darkAmber} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Email liên hệ</Text>
            <Text style={styles.infoValue}>{userProfile.email}</Text>
          </View>
        </View>

        {/* Mock thêm trường Địa điểm cho UI thêm phong phú */}
        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <MapPin size={20} color={COLORS.darkAmber} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Khu vực</Text>
            <Text style={styles.infoValue}>Hồ Chí Minh, Việt Nam</Text>
          </View>
        </View>
      </View>

      {/* 5. KHU VỰC NÚT BẤM (GỌN GÀNG, HIỆN ĐẠI) */}
      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.8}
        onPress={() => alert("Chuyển sang màn hình Statistics")}
      >
        <Activity size={20} color={COLORS.white} />
        <Text style={styles.actionBtnText}>Xem Thống Kê Hoạt Động</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionBtn,
          {
            backgroundColor: COLORS.white,
            borderColor: COLORS.amberGold,
            borderWidth: 2,
            elevation: 0,
            shadowOpacity: 0,
          },
        ]}
        activeOpacity={0.8}
        onPress={() => alert("Mở form sửa firstName, lastName, bio")}
      >
        <Edit3 size={20} color={COLORS.amberGold} />
        <Text style={[styles.actionBtnText, { color: COLORS.amberGold }]}>
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
