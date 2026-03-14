import { StyleSheet } from "react-native";

export const COLORS = {
  white: "#FFFFFF",
  amberGold: "#F5A623",
  darkAmber: "#D48806",
  lightYellow: "#FFFDF9",
  lightGray: "#F4F5F7", // Xám rất nhạt, sang trọng hơn
  borderColor: "#EAEAEA",
  textMain: "#1C1C1E",
  textSub: "#8E8E93",
  danger: "#FF3B30",
};

export const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.lightGray,
    paddingBottom: 40,
  },

  // --- HIỆU ỨNG NỀN CONG Ở TRÊN CÙNG ---
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 220,
    backgroundColor: COLORS.amberGold,
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    zIndex: 0,
  },

  // --- KHU VỰC AVATAR & TÊN ---
  profileContent: {
    alignItems: "center",
    marginTop: 130, // Đẩy xuống để cắt ngang đường cong của header
    zIndex: 1,
  },
  avatarContainer: {
    padding: 6,
    borderRadius: 70,
    backgroundColor: COLORS.white,
    shadowColor: COLORS.darkAmber,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  name: {
    fontSize: 26,
    fontWeight: "900",
    color: COLORS.textMain,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  bioValue: {
    fontSize: 15,
    color: COLORS.textSub,
    fontStyle: "italic",
    paddingHorizontal: 30,
    textAlign: "center",
    marginBottom: 20,
  },

  // --- KHU VỰC THỐNG KÊ (GAMIFICATION) ---
  statsContainer: {
    flexDirection: "row",
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: COLORS.darkAmber,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSub,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderColor,
    height: "80%",
    alignSelf: "center",
  },

  // --- THẺ THÔNG TIN (FLOATING CARD) ---
  cardContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 24,
    marginHorizontal: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textSub,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.lightYellow,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 13,
    color: COLORS.textSub,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.textMain,
  },

  // --- NÚT HÀNH ĐỘNG CÁ TÍNH ---
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.amberGold,
    marginHorizontal: 20,
    height: 54,
    borderRadius: 27,
    marginBottom: 16,
    shadowColor: COLORS.darkAmber,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  actionBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.white,
    marginLeft: 8,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(255, 59, 48, 0.1)", // Nền đỏ trong suốt, cực kỳ tinh tế
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.3)",
  },
  logoutBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.danger,
    marginLeft: 8,
  },
});
