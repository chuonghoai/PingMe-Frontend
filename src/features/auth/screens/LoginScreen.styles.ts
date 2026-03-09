import { StyleSheet } from "react-native";

// Bảng màu đồng bộ với SplashScreen
export const COLORS = {
  white: "#FFFFFF",
  amberGold: "#F5A623",
  darkAmber: "#D48806",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  // Styles cho Logo
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTextMain: {
    fontSize: 56,
    fontWeight: "900",
    color: COLORS.darkAmber,
    fontStyle: "italic",
    letterSpacing: -2,
    textShadowColor: "rgba(245, 166, 35, 0.3)",
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 8,
  },
  logoTextSecondary: {
    fontSize: 56,
    fontWeight: "900",
    color: COLORS.amberGold,
    fontStyle: "italic",
    marginLeft: -4,
  },
  // Styles cho các text khác
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
    color: COLORS.darkAmber,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  forgotText: {
    color: COLORS.amberGold,
    fontSize: 14,
    fontWeight: "600",
  },
});
