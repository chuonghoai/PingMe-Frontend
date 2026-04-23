import { StyleSheet } from "react-native";

import { PINGME_COLORS } from "@/constants/theme";

// Bảng màu đồng bộ GoGo (Sau này bạn có thể đưa cục này ra file theme.ts chung)
export const COLORS = {
  white: PINGME_COLORS.bgWhite,
  amberGold: PINGME_COLORS.primary,
  darkAmber: PINGME_COLORS.primary,
  successGreen: PINGME_COLORS.online, // Giữ màu xanh lá cho thông báo thành công
  grayText: PINGME_COLORS.textSecondary,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: COLORS.white,
  },
  // Khối Logo đồng bộ
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoTextMain: {
    fontSize: 48,
    fontWeight: "900",
    color: COLORS.darkAmber,
    fontStyle: "italic",
    letterSpacing: -2,
    textShadowColor: "rgba(245, 166, 35, 0.3)",
    textShadowOffset: { width: 2, height: 4 },
    textShadowRadius: 8,
  },
  logoTextSecondary: {
    fontSize: 48,
    fontWeight: "900",
    color: COLORS.amberGold,
    fontStyle: "italic",
    marginLeft: -4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
    color: COLORS.darkAmber, // Đổi từ Xanh dương sang Vàng sậm
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
  },

  // Styles cho trạng thái thành công
  successContainer: {
    alignItems: "center",
    paddingVertical: 20,
  },
  successIcon: {
    fontSize: 60,
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: COLORS.successGreen,
    marginBottom: 12,
  },
  successText: {
    fontSize: 14,
    color: COLORS.grayText,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
});
