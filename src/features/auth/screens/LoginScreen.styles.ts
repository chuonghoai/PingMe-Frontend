import { StyleSheet } from "react-native";
import { PINGME_COLORS } from "@/constants/theme";

export const COLORS = PINGME_COLORS;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: COLORS.bgWhite,
  },

  // ── LOGO ──
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTextMain: {
    fontSize: 52,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -2,
    textShadowColor: "rgba(0, 194, 255, 0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  logoTextSecondary: {
    fontSize: 52,
    fontWeight: "900",
    color: COLORS.secondary,
    marginLeft: 2,
    letterSpacing: -2,
    textShadowColor: "rgba(139, 92, 246, 0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },

  // ── TITLE ──
  titleWrapper: {
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
    fontWeight: "500",
  },

  // ── OPTIONS ROW ──
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
  },
  rememberText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  forgotText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: "700",
  },

  // ── BUTTONS ──
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  registerBtnWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  registerTextPrefix: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  registerTextAction: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
