import { StyleSheet } from "react-native";

export const COLORS = {
  white: "#FFFFFF",
  amberGold: "#F5A623",
  darkAmber: "#D48806",
  lightYellow: "#FFFDF9",
  lightGray: "#F2F3F5",
  borderColor: "#EAEAEA",
  textMain: "#1C1C1E",
  textSub: "#8E8E93",
  onlineGreen: "#34C759",
};

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "flex-end",
  },
  bottomSheet: {
    height: "75%",
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 20,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
  },

  // Thanh nắm kéo (Khu vực cảm biến vuốt)
  dragHandleContainer: {
    height: 40, // Đủ rộng để ngón tay dễ chạm vào
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.white,
  },
  dragHandle: {
    width: 44,
    height: 5,
    backgroundColor: "#DDDDDD",
    borderRadius: 3,
  },
  // Đã xóa hoàn toàn class closeBtn

  headerContainer: {
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
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.textMain,
    paddingVertical: 10,
  },
  addFriendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.amberGold,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.darkAmber,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },

  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.lightGray,
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: COLORS.onlineGreen,
    borderWidth: 2,
    borderColor: COLORS.white,
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
    alignItems: "center",
  },
  chatName: {
    fontSize: 17,
    fontWeight: "700",
    color: COLORS.textMain,
    flex: 1,
    marginRight: 8,
  },
  chatTime: {
    fontSize: 12,
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
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: "bold",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  emptyText: {
    color: COLORS.textSub,
    fontSize: 16,
    marginTop: 12,
  },
});
