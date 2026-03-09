import { StyleSheet } from "react-native";

// Bảng màu đồng bộ
export const COLORS = {
  white: "#FFFFFF",
  amberGold: "#F5A623",
  darkAmber: "#D48806",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5", // Nền xám nhạt để làm nổi bật card màu trắng
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  icon: {
    fontSize: 60,
    marginBottom: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    color: COLORS.darkAmber, // Đổi màu tiêu đề sang Vàng sậm
  },
  description: {
    textAlign: "center",
    color: "#666",
    lineHeight: 22,
    marginBottom: 30,
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sliderText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});
