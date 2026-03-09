import { StyleSheet } from "react-native";

// Bảng màu đồng bộ với SplashScreen và Login/Register
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
    marginBottom: 16,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTextMain: {
    fontSize: 48,
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
  icon: { fontSize: 60, textAlign: "center", marginBottom: 20 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: COLORS.darkAmber,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },
  highlightEmail: { fontWeight: "bold", color: COLORS.amberGold },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  resendText: { color: "#666", fontSize: 14 },
  resendLink: { color: COLORS.amberGold, fontSize: 14, fontWeight: "bold" },
  disabledLink: { color: "#999" },
});
