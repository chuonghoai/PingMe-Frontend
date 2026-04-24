import { StyleSheet } from "react-native";

import { PINGME_COLORS } from "@/constants/theme";

export const COLORS = {
  white: PINGME_COLORS.bgWhite,
  amberGold: PINGME_COLORS.primary,
  darkAmber: PINGME_COLORS.primary,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
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
    color: COLORS.darkAmber,
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
