import { useRouter } from "expo-router";
import React from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { Button } from "../../../components/Button/Button";
import { useUser } from "../../../store/UserContext";

// Nạp Styles và Bảng màu từ file bên ngoài vào
import { COLORS, styles } from "./ProfileScreen.styles";

export const ProfileScreen = () => {
  const router = useRouter();
  const { userProfile, logout } = useUser();

  const handleLogout = () => {
    logout();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Phần Header chứa Avatar và Tên (Ghép firstName + lastName) */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: userProfile.avatarUrl }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>
          {`${userProfile.firstName} ${userProfile.lastName}`}
        </Text>
        <Text style={styles.email}>{userProfile.email}</Text>
      </View>

      {/* Phần Thông tin chi tiết */}
      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Thông tin cá nhân</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Họ và Tên</Text>
          <Text style={styles.infoValue}>
            {`${userProfile.firstName} ${userProfile.lastName}`}
          </Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{userProfile.email}</Text>
        </View>
        <View style={styles.divider} />

        <View style={styles.infoRowColumn}>
          <Text style={styles.infoLabel}>Tiểu sử (Bio)</Text>
          <Text style={styles.bioValue}>{userProfile.bio}</Text>
        </View>
      </View>

      {/* Nút hành động */}
      <View style={styles.actionSection}>
        {/* Nút Thống Kê (Dựa trên luồng VIEW STATISTICS FLOW) */}
        <Button
          title="Xem Thống Kê Hoạt Động"
          onPress={() => alert("Chuyển sang màn hình Statistics")}
          style={{ backgroundColor: COLORS.amberGold, marginBottom: 12 }}
        />

        <Button
          title="Chỉnh sửa hồ sơ"
          variant="outline"
          onPress={() => alert("Mở form sửa firstName, lastName, bio")}
          style={{ borderColor: COLORS.amberGold }}
        />

        <Button
          title="Đăng xuất"
          style={{ backgroundColor: "#FF3B30", marginTop: 12 }}
          onPress={handleLogout}
        />
      </View>
    </ScrollView>
  );
};
