import { PINGME_COLORS } from "@/constants/theme";
import { Platform, StyleSheet } from "react-native";

export const COLORS = {
  ...PINGME_COLORS,
  white: PINGME_COLORS.white,
  amberGold: PINGME_COLORS.warning,
  darkAmber: PINGME_COLORS.primary,
  lightYellow: PINGME_COLORS.bgMid,
  borderColor: PINGME_COLORS.border,
  inputBackground: PINGME_COLORS.bgMid,
  iconGray: PINGME_COLORS.textMuted,
  iconActive: PINGME_COLORS.primary,
  textMain: PINGME_COLORS.textPrimary,
  textSub: PINGME_COLORS.textSecondary,
  bgDarker: PINGME_COLORS.bgMid,
  borderLight: PINGME_COLORS.border,
  errorRed: PINGME_COLORS.danger,
  bgDark: PINGME_COLORS.bgDark,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgWhite,
  },

  // ── HEADER ──
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.bgWhite,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.bgMid,
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerName: {
    fontSize: 17,
    fontWeight: "800",
    color: COLORS.textPrimary,
  },
  headerStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.online,
    marginRight: 6,
  },
  headerStatus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "600",
  },
  headerActions: {
    flexDirection: "row",
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 4,
  },

  // ── MESSAGE LIST ──
  chatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageBubble: {
    maxWidth: "78%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  myMessage: {
    // Vibrant Cyan gradient feel
    backgroundColor: COLORS.primary,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: COLORS.bgSurface,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },
  myMessageText: {
    color: COLORS.white,
  },
  timeText: {
    fontSize: 11,
    alignSelf: "flex-end",
    marginTop: 4,
    fontWeight: "500",
  },
  theirTimeText: {
    color: COLORS.textSecondary,
  },
  myTimeText: {
    color: "rgba(255,255,255,0.75)",
  },

  // ── INPUT BAR ──
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 10,
    backgroundColor: COLORS.bgWhite,
    borderTopWidth: 1,
    borderColor: COLORS.border,
  },
  mediaButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  mediaButton: {
    padding: 8,
    marginRight: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.bgMid,
    borderRadius: 24,
    paddingHorizontal: 12,
    minHeight: 40,
    maxHeight: 120,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textPrimary,
    paddingVertical: 10,
    paddingRight: 8,
    ...(Platform.OS === "android" ? { padding: 0 } : {}),
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },
  stickerButton: {
    padding: 4,
  },
  sendBtn: {
    marginBottom: 8,
    padding: 10,
    marginLeft: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 22,
    width: 44,
    height: 44,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
