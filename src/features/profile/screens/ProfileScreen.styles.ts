import { StyleSheet, Dimensions } from "react-native";
import { PINGME_COLORS } from "@/constants/theme";

export const COLORS = {
  ...PINGME_COLORS,
  textMuted: "#9CA3AF",
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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
    marginBottom: 2,
    letterSpacing: 0.3,
  },
  username: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontWeight: "600",
    marginBottom: 8,
  },
  bioValue: {
    fontSize: 15,
    color: COLORS.textSecondary,
    fontStyle: "italic",
    paddingHorizontal: 30,
    textAlign: "center",
    marginBottom: 8,
    lineHeight: 22,
  },
  joinDateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 24,
  },
  joinDateText: {
    fontSize: 13,
    color: COLORS.textMuted,
    fontWeight: "500",
  },

  // ── STATS CARD ──
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.bgWhite,
    borderRadius: 20,
    paddingVertical: 20,
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
    flex: 1,
  },
  statNumber: {
    fontSize: 24,
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

  // ── SETTINGS CARD ──
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
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  settingText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: COLORS.textPrimary,
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

  // ── MODAL ──
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: COLORS.bgWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "80%",
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgMid,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── FRIEND LIST ITEM ──
  friendItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  friendAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  friendName: {
    fontSize: 15,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  friendStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  unfriendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 56, 96, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── EDIT PROFILE MODAL ──
  editLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: COLORS.bgMid,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.textPrimary,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.3,
  },
});
