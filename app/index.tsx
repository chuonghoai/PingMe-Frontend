import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
    Animated,
    Dimensions,
    Easing,
    StyleSheet,
    Text,
    View,
} from "react-native";

const { width, height } = Dimensions.get("window");

// Bảng màu Vàng Cao cấp
const COLORS = {
  white: "#FFFFFF",
  lightYellow: "#FFE5B4",
  amberGold: "#F5A623",
  darkAmber: "#D48806", // Màu nhấn đậm hơn cho logo để tạo chiều sâu
};

// Tính toán kích thước để hình tròn có thể bao phủ toàn bộ màn hình khi bung ra
const CIRCLE_SIZE = height * 1.5;

export default function SplashScreen() {
  const router = useRouter();

  // --- Khai báo các giá trị Animation ---
  // 1. Giọt sáng rơi xuống
  const dropAnim = useRef(new Animated.Value(-height / 2 - 100)).current;
  // 2. Giọt sáng bùng nổ lấp đầy màn hình
  const expandAnim = useRef(new Animated.Value(0.02)).current; // Bắt đầu cực nhỏ
  // 3. Logo nảy lên
  const logoSlideAnim = useRef(new Animated.Value(50)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  // 4. Đường gạch chân lướt ngang
  const lineWidthAnim = useRef(new Animated.Value(0)).current;
  // 5. Slogan hiện lên
  const sloganOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Bước 1: Giọt sáng rơi từ trên xuống giữa màn hình
      Animated.timing(dropAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.bounce, // Hiệu ứng nảy tưng tưng khi chạm đất
        useNativeDriver: true,
      }),

      // Bước 2: Giọt sáng lập tức bùng nổ lấp đầy màn hình
      Animated.timing(expandAnim, {
        toValue: 1, // Scale lên 100% của CIRCLE_SIZE
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1), // Nở ra cực mượt
        useNativeDriver: true,
      }),

      // Bước 3: Hiện chữ GoGo và các thành phần khác
      Animated.parallel([
        // Logo nảy lên từ dưới
        Animated.spring(logoSlideAnim, {
          toValue: 0,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        // Gạch chân lướt từ trái sang phải
        Animated.timing(lineWidthAnim, {
          toValue: 1, // Sẽ dùng interpolate để biến đổi thành width
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false, // width không hỗ trợ native driver
        }),
        // Slogan fade in
        Animated.timing(sloganOpacityAnim, {
          toValue: 1,
          duration: 800,
          delay: 200, // Đợi logo nảy lên 1 chút rồi mới hiện slogan
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Tự động chuyển trang sau 3.2 giây
    const timer = setTimeout(() => {
      router.replace("/(auth)/login");
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  // Biến đổi giá trị 0 -> 1 thành chiều dài thật của thanh gạch chân (0px -> 80px)
  const interpolatedLineWidth = lineWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 80],
  });

  return (
    // Nền gốc ban đầu là màu Vàng Hổ Phách
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* --- Giọt sáng bùng nổ (The Bursting Drop) --- */}
      <Animated.View
        style={[
          styles.expandingCircle,
          {
            transform: [
              { translateY: dropAnim }, // Rơi xuống
              { scale: expandAnim }, // Bùng nổ kích thước
            ],
          },
        ]}
      />

      {/* --- Nội dung chính --- */}
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: logoOpacityAnim,
            transform: [{ translateY: logoSlideAnim }],
          },
        ]}
      >
        <View style={styles.logoRow}>
          <Text style={styles.logoTextMain}>Go</Text>
          <Text style={styles.logoTextSecondary}>Go</Text>
        </View>

        {/* Thanh gạch chân chạy ngang */}
        <Animated.View
          style={[styles.dynamicLine, { width: interpolatedLineWidth }]}
        />

        {/* Slogan */}
        <Animated.Text style={[styles.tagline, { opacity: sloganOpacityAnim }]}>
          Khởi nguồn mọi hành trình
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.amberGold, // Nền ban đầu
    justifyContent: "center",
    alignItems: "center",
  },
  // Hình tròn trắng đóng vai trò làm giọt sáng & phông nền sau khi bùng nổ
  expandingCircle: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: COLORS.white,
  },
  contentWrapper: {
    alignItems: "center",
    zIndex: 10, // Đảm bảo nổi lên trên nền trắng
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logoTextMain: {
    fontSize: 72,
    fontWeight: "900",
    color: COLORS.darkAmber, // Vàng đậm tạo khối
    fontStyle: "italic",
    letterSpacing: -2,
    textShadowColor: "rgba(245, 166, 35, 0.3)", // Đổ bóng nhẹ cùng màu
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 8,
  },
  logoTextSecondary: {
    fontSize: 72,
    fontWeight: "900",
    color: COLORS.amberGold, // Vàng sáng
    fontStyle: "italic",
    marginLeft: -4,
  },
  dynamicLine: {
    height: 5,
    backgroundColor: COLORS.darkAmber,
    borderRadius: 3,
    marginBottom: 16,
    // Căn trái để hiệu ứng chạy từ trái sang phải
    alignSelf: "center",
  },
  tagline: {
    fontSize: 15,
    color: COLORS.amberGold,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
});
