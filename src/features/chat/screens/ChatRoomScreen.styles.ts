import { Platform, StyleSheet } from "react-native";

export const COLORS = {
  white: "#FFFFFF",
  amberGold: "#F5A623",
  darkAmber: "#D48806",
  lightYellow: "#FFFDF9", // Đổi màu nền sáng hơn một chút cho sang trọng
  borderColor: "#EAEAEA",
  inputBackground: "#F2F3F5",
  iconGray: "#8E8E93",
  iconActive: "#F5A623", // Vàng hổ phách cho icon đang hoạt động
  textMain: "#1C1C1E",
  textSub: "#8E8E93",
};

export const styles = StyleSheet.create({
  // --- TỔNG THỂ ---
  container: {
    flex: 1,
    backgroundColor: COLORS.lightYellow,
  },

  // --- HEADER CHUYÊN NGHIỆP ---
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20, // Xử lý SafeArea
    paddingBottom: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
    marginLeft: -8, // Kéo nhẹ sang trái cho cân
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.inputBackground,
    marginRight: 12,
  },
  headerTitleContainer: {
    flex: 1,
    justifyContent: "center",
  },
  headerName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textMain,
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
    backgroundColor: "#34C759", // Màu xanh lá online
    marginRight: 6,
  },
  headerStatus: {
    fontSize: 12,
    color: COLORS.textSub,
  },
  headerActions: {
    flexDirection: "row",
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 8,
  },

  // --- DANH SÁCH TIN NHẮN ---
  chatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageBubble: {
    maxWidth: "75%",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessage: {
    backgroundColor: COLORS.amberGold,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: COLORS.white,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  messageText: {
    fontSize: 16,
    color: COLORS.textMain,
    lineHeight: 22,
  },
  myMessageText: {
    color: COLORS.white,
  },
  timeText: {
    fontSize: 11,
    alignSelf: "flex-end",
    marginTop: 4,
  },
  theirTimeText: {
    color: COLORS.textSub,
  },
  myTimeText: {
    color: "rgba(255,255,255,0.7)",
  },

  // --- THANH NHẬP LIỆU ---
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 12,
    paddingVertical: 10,
    paddingBottom: Platform.OS === "ios" ? 30 : 10, // Kéo lên trên iOS
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: COLORS.borderColor,
  },
  mediaButtonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8, // Căn giữa với ô input dòng đầu
  },
  mediaButton: {
    padding: 8,
    marginRight: 4,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 24,
    paddingHorizontal: 12,
    minHeight: 40,
    maxHeight: 120, // Không cho phình to quá mức
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMain,
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
    padding: 8,
    marginLeft: 4,
  },
});
