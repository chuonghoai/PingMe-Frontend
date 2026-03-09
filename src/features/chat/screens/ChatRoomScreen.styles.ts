import { Platform, StyleSheet } from "react-native";

// Bảng màu mở rộng cho giao diện chat hiện đại
export const COLORS = {
  white: "#FFFFFF",
  amberGold: "#F5A623", // Màu chủ đạo của mình
  darkAmber: "#D48806", // Màu nhấn đậm
  lightYellow: "#FFF9ED", // Nền chat sáng, ngả vàng kem rất nhẹ (tinh tế hơn)
  borderColor: "#F0F0F0", // Viền nhạt hơn
  inputBackground: "#F2F3F5", // Nền xám rất nhạt cho ô nhập liệu (kiểu Messenger)
  iconGray: "#8E8E93", // Màu xám cho các icon tiện ích (ảnh, video)
  textMain: "#1C1C1E",
};

export const styles = StyleSheet.create({
  // --- TỔNG THỂ ---
  container: {
    flex: 1,
    backgroundColor: COLORS.lightYellow, // Nền sáng sủa, sạch sẽ hơn
  },

  // --- HEADER ---
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    // Bóng đổ nhẹ thay vì viền cứng
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 3,
    zIndex: 10, // Đảm bảo header nổi lên trên danh sách chat
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  backIconChar: {
    fontSize: 24,
    color: COLORS.amberGold,
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
  headerStatus: {
    fontSize: 12,
    color: COLORS.iconGray,
    marginTop: 2,
  },

  // --- DANH SÁCH TIN NHẮN ---
  chatListContent: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  messageBubble: {
    maxWidth: "75%", // Thu hẹp lại một chút cho gọn
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20, // Bo tròn nhiều hơn, trông hiện đại hơn
    marginBottom: 10,
    // Bóng đổ rất nhẹ
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  // Tin nhắn của mình (Bên phải, màu Vàng)
  myMessage: {
    backgroundColor: COLORS.amberGold,
    alignSelf: "flex-end",
    borderBottomRightRadius: 4, // Tạo hiệu ứng "đuôi" tin nhắn
  },
  // Tin nhắn người ta (Bên trái, màu Trắng)
  theirMessage: {
    backgroundColor: COLORS.white,
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4, // Tạo hiệu ứng "đuôi" tin nhắn
  },
  messageText: {
    fontSize: 16,
    color: COLORS.textMain,
    lineHeight: 22,
  },
  myMessageText: {
    color: COLORS.white, // Chữ trắng trên nền vàng
  },
  timeText: {
    fontSize: 11,
    color: COLORS.iconGray,
    alignSelf: "flex-end",
    marginTop: 6,
    marginBottom: -4, // Kéo sát xuống góc
  },
  myTimeText: {
    color: "rgba(255,255,255,0.8)",
  },

  // --- THANH NHẬP LIỆU (MỚI & CẢI TIẾN) ---
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end", // Căn dưới để khi input nhiều dòng thì các nút vẫn ở đáy
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderColor: COLORS.borderColor,
    // Bóng đổ ngược lên trên
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 5,
  },
  // Cụm nút media bên trái (Ảnh, Video)
  mediaButtonsContainer: {
    flexDirection: "row",
    marginBottom: 10, // Căn chỉnh với chiều cao của input
    marginRight: 8,
  },
  mediaButton: {
    padding: 6,
    marginRight: 4,
  },
  mediaIconChar: {
    fontSize: 24, // Kích thước icon (tạm dùng emoji)
    // color: COLORS.iconGray, // Nếu dùng icon thật thì set màu ở đây
  },

  // Bao bọc TextInput và nút Sticker
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.inputBackground,
    borderRadius: 24, // Bo tròn mạnh
    paddingHorizontal: 12,
    minHeight: 44, // Chiều cao tối thiểu
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMain,
    paddingVertical: 8,
    paddingRight: 8, // Để không đè lên nút sticker
    maxHeight: 100, // Giới hạn chiều cao khi nhập nhiều dòng
    ...(Platform.OS === "android" ? { padding: 0 } : {}), // Fix lỗi padding trên Android
  },
  stickerButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  stickerIconChar: {
    fontSize: 28,
    // color: COLORS.iconGray, // Tạm dùng emoji
  },

  // Nút gửi
  sendBtn: {
    marginBottom: 8, // Căn chỉnh với input
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  sendBtnText: {
    color: COLORS.amberGold,
    fontWeight: "800",
    fontSize: 17,
  },
});
