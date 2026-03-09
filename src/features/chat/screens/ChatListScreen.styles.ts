import { StyleSheet } from "react-native";

// Bảng màu đồng bộ GoGo
export const COLORS = {
  white: "#FFFFFF",
  amberGold: "#F5A623",
  darkAmber: "#D48806",
  lightYellow: "#FFE5B4",
  lightGray: "#F5F5F5",
  borderColor: "#EEEEEE",
  textMain: "#1C1C1E",
  textSub: "#8E8E93",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },

  // --- KHU VỰC SEARCH (ĐÃ BỎ TITLE) ---
  headerContainer: {
    paddingTop: 16, // Bạn có thể tăng lên 24 nếu thấy nó quá sát viền trên (notch)
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.lightGray,
    borderRadius: 20,
    paddingHorizontal: 14,
    marginRight: 12,
    height: 42,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMain,
  },

  // Nút Add Friend hình tròn
  addFriendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.amberGold,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.darkAmber,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addFriendIcon: {
    color: COLORS.white,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
  },

  // --- KHU VỰC DANH SÁCH CHAT ---
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: COLORS.lightGray,
  },
  chatInfo: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    paddingBottom: 16,
    paddingTop: 4,
  },
  chatHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  chatName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.textMain,
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 13,
    color: COLORS.textSub,
  },
  chatFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lastMessage: {
    fontSize: 15,
    color: COLORS.textSub,
    flex: 1,
    marginRight: 16,
  },
  unreadMessage: {
    color: COLORS.textMain,
    fontWeight: "700",
  },
  unreadBadge: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: "center",
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    color: COLORS.textSub,
    fontStyle: "italic",
    fontSize: 15,
  },
});
