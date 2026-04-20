import { StyleSheet } from "react-native";
import { PINGME_COLORS } from "@/constants/theme";

export const COLORS = PINGME_COLORS;

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: COLORS.bgWhite,
  },

  // ── LOGO ──
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTextMain: {
    fontSize: 44,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -2,
    textShadowColor: "rgba(0, 194, 255, 0.4)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 16,
  },
  logoTextSecondary: {
    fontSize: 44,
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
    marginBottom: 24,
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

  // ── BUTTONS ──
  registerBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    marginTop: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  registerBtnText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  loginLinkWrapper: {
    marginTop: 20,
    alignItems: "center",
  },
  loginTextPrefix: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
  loginTextAction: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "800",
    textDecorationLine: "underline",
  },
});
