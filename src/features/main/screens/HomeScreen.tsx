import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

// Nạp Styles và Bảng màu từ file bên ngoài vào
import { styles } from "./HomeScreen.styles";

export const HomeScreen = () => {
  const router = useRouter();
  // Lấy kích thước vùng an toàn (tai thỏ, status bar, thanh điều hướng dưới)
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      {/* 1. Khu vực giả lập Bản đồ (Nằm dưới cùng) */}
      <View style={styles.mapPlaceholder}>
        <Text style={styles.mapIcon}>🗺️</Text>
        <Text style={styles.mapText}>Khu vực hiển thị Bản đồ</Text>
        <Text style={styles.mapSubText}>
          (Sẽ tích hợp Google Maps / Apple Maps sau)
        </Text>
      </View>

      {/* 2. Nút Profile (Nổi ở góc trái, phía trên) */}
      <TouchableOpacity
        style={[
          styles.floatingBtn,
          styles.profileBtn,
          { top: insets.top + 16 },
        ]}
        onPress={() => router.push("/(main)/profile")}
        activeOpacity={0.8}
      >
        <Text style={styles.stickerIcon}>👤</Text>
      </TouchableOpacity>

      {/* 3. Nút Chat (Nổi ở giữa, phía dưới) */}
      <TouchableOpacity
        style={[
          styles.floatingBtn,
          styles.chatBtn,
          { bottom: insets.bottom + 24 },
        ]}
        onPress={() => router.push("/(main)/chat")}
        activeOpacity={0.8}
      >
        {/* Nút chat làm to hơn và đổi thiết kế */}
        <Text style={[styles.stickerIcon, { fontSize: 32 }]}>💬</Text>
      </TouchableOpacity>
    </View>
  );
};
