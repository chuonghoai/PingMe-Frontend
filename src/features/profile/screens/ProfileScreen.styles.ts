import { StyleSheet } from "react-native";
import { PINGME_COLORS } from "@/constants/theme";

export const COLORS = PINGME_COLORS;

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.bgMid,
    paddingBottom: 40,
  },

  // ── HEADER GRADIENT BG ──
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    zIndex: 0,
    // Cheap gradient illusion with opacity layer
    opacity: 0.9,
  },

  // ── AVATAR & NAME ──
  profileContent: {
    alignItems: "center",
    marginTop: 130,
    zIndex: 1,
  },
  avatarContainer: {
    padding: 5,
    borderRadius: 70,
    backgroundColor: COLORS.bgWhite,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.textPrimary,
    marginBottom: 4,
    letterSpacing: 0.3,
  },
  bioValue: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    paddingHorizontal: 30,
    textAlign: "center",
    marginBottom: 24,
  },

  // ── STATS CARD ──
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.bgWhite,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 22,
    fontWeight: "900",
    color: COLORS.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    height: "80%",
    alignSelf: "center",
  },

  // ── INFO CARD ──
  cardContainer: {
    backgroundColor: COLORS.bgWhite,
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#EFF6FF', // Soft cyan tint
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },

  // ── ACTION BUTTONS ──
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.primary,
    marginHorizontal: 20,
    height: 54,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: COLORS.white,
    marginLeft: 8,
    letterSpacing: 0.3,
  },

  // ── LOGOUT BUTTON ──
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    height: 54,
    borderRadius: 16,
    backgroundColor: "rgba(255, 56, 96, 0.08)",
    borderWidth: 1.5,
    borderColor: "rgba(255, 56, 96, 0.3)",
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.danger,
    marginLeft: 8,
  },
});
