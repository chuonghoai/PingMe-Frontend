import { StyleSheet } from "react-native";

export const COLORS = {
  primary: "#1877F2",
  amberGold: "#FFC107",
  background: "#F0F2F5",
  text: "#1C1E21",
  textMuted: "#65676B",
  white: "#FFFFFF",
  border: "#CCD0D5",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: COLORS.white,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.text,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textMuted,
    marginBottom: 30,
    lineHeight: 22,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.text,
    marginBottom: 6,
    marginTop: 10,
  },

  // Nút nhấn giả lập ô Input để mở Popup
  selectorBox: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: COLORS.background,
    marginBottom: 15,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.text,
  },

  // Khung Modal cho Chọn Giới tính
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    width: "100%",
    padding: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 15,
    color: COLORS.text,
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.background,
  },
  modalItemText: {
    fontSize: 16,
    textAlign: "center",
    color: COLORS.text,
  },
  modalItemTextSelected: {
    color: COLORS.primary,
    fontWeight: "bold",
  },
});
