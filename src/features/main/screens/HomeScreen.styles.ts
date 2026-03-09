import { StyleSheet } from "react-native";

// Bảng màu đồng bộ của dự án GoGo
export const COLORS = {
  white: "#FFFFFF",
  amberGold: "#F5A623",
  darkAmber: "#D48806",
  lightYellow: "#FFE5B4",
  mapBackground: "#F8F9FA", // Xám trắng rất nhạt, tạo cảm giác bản đồ sạch sẽ
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  // Style cho phần giả lập bản đồ chiếm toàn màn hình
  mapPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.mapBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  mapIcon: {
    fontSize: 54, // Tăng nhẹ kích thước icon bản đồ
    marginBottom: 12,
  },
  mapText: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.darkAmber, // Đổi màu text bản đồ sang tone vàng sậm
  },
  mapSubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    fontStyle: "italic",
  },
  // Style chung cho các nút bấm nổi (Floating Button)
  floatingBtn: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    // Chuyển bóng đổ từ đen sang màu vàng sậm để tạo hiệu ứng "phát sáng" đồng bộ
    shadowColor: COLORS.darkAmber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  // Style riêng cho nút Profile
  profileBtn: {
    left: 20,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.lightYellow, // Viền mỏng màu vàng kem cho tinh tế
  },
  // Style riêng cho nút Chat
  chatBtn: {
    alignSelf: "center",
    width: 76, // Tăng thêm kích thước để làm nút trung tâm
    height: 76,
    borderRadius: 38,
    backgroundColor: COLORS.amberGold, // Đổi màu nền sang Vàng Hổ Phách
    borderWidth: 4, // Thêm viền dày màu vàng kem tạo hiệu ứng nổi khối 3D
    borderColor: COLORS.lightYellow,
  },
  stickerIcon: {
    fontSize: 24,
  },
});
