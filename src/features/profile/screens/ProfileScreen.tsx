import { authApi } from "@/src/services/authApi";
import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import {
  Activity,
  Edit3,
  LogOut,
  Mail,
  MapPin,
  User,
} from "lucide-react-native";
import { useUser } from "../../../store/UserContext";
import { clearTokens, getRefreshToken } from "../../../utils/tokenStorage";
import { COLORS, styles } from "./ProfileScreen.styles";

export const ProfileScreen = () => {
  const router = useRouter();
  const { userProfile, logout } = useUser();

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
      console.error("Loi dang xuat:", error);
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
          {userProfile.bio || "Chua co tieu su. Hay them mot vai dieu thu vi ve ban nhe!"}
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>142</Text>
          <Text style={styles.statLabel}>Ban be</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>28</Text>
          <Text style={styles.statLabel}>Dia diem</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>5</Text>
          <Text style={styles.statLabel}>Chuoi ngay</Text>
        </View>
      </View>

      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Ho so ca nhan</Text>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <User size={20} color={COLORS.darkAmber} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Ho va ten</Text>
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
            <Text style={styles.infoLabel}>Email lien he</Text>
            <Text style={styles.infoValue}>{userProfile.email}</Text>
          </View>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.iconBox}>
            <MapPin size={20} color={COLORS.darkAmber} />
          </View>
          <View style={styles.infoTextContainer}>
            <Text style={styles.infoLabel}>Khu vuc</Text>
            <Text style={styles.infoValue}>Ho Chi Minh, Viet Nam</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.actionBtn}
        activeOpacity={0.8}
        onPress={() => alert("Chuyen sang man hinh Statistics")}
      >
        <Activity size={20} color={COLORS.white} />
        <Text style={styles.actionBtnText}>Xem Thong Ke Hoat Dong</Text>
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
        onPress={() => alert("Mo form sua firstName, lastName, bio")}
      >
        <Edit3 size={20} color={COLORS.amberGold} />
        <Text style={[styles.actionBtnText, { color: COLORS.amberGold }]}>
          Chinh sua ho so
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.logoutBtn}
        activeOpacity={0.8}
        onPress={handleLogout}
      >
        <LogOut size={20} color={COLORS.danger} />
        <Text style={styles.logoutBtnText}>Dang xuat</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};
