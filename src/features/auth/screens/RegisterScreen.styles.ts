import { StyleSheet } from "react-native";

// Bảng màu đồng bộ với SplashScreen
export const COLORS = {
  white: "#FFFFFF",
  amberGold: "#F5A623",
  darkAmber: "#D48806",
};

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: "center",
  },
  // Styles cho Logo
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTextMain: {
    fontSize: 48, // Chữ nhỏ hơn Login một chút để tiết kiệm diện tích cho form
    fontWeight: "900",
    color: COLORS.darkAmber,
    fontStyle: "italic",
    letterSpacing: -2,
    textShadowColor: "rgba(245, 166, 35, 0.3)",
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 8,
  },
  logoTextSecondary: {
    fontSize: 48,
    fontWeight: "900",
    color: COLORS.amberGold,
    fontStyle: "italic",
    marginLeft: -4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: COLORS.darkAmber, // Đổi từ Xanh lá sang Vàng sậm
  },
});
