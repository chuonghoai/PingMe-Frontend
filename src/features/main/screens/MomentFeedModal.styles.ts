import { PINGME_COLORS } from "@/constants/theme";
import { StyleSheet } from "react-native";

const COLORS = PINGME_COLORS;

export const momentFeedStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 9999,
  },

  // ── Header ──
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  headerClose: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  headerSpacer: {
    width: 42,
  },

  // ── Feed List ──
  feedList: {
    flex: 1,
  },
  feedListContent: {
    paddingBottom: 60,
  },

  // ── Moment Card ──
  momentCard: {
    marginBottom: 2,
    backgroundColor: "#0A0A0A",
  },
  momentImageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 3 / 4,
  },
  momentImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },

  // ── Gradient Overlay on Image ──
  momentGradientTop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  momentGradientBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 160,
  },

  // ── User Info (overlaid on image bottom) ──
  momentUserRow: {
    position: "absolute",
    bottom: 56,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  momentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  momentUserInfo: {
    flex: 1,
    marginLeft: 10,
  },
  momentUserName: {
    fontSize: 15,
    fontWeight: "800",
    color: "#fff",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 4,
  },
  momentTimeText: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontWeight: "500",
  },

  // ── Caption (overlaid on image bottom) ──
  momentCaption: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 80,
  },
  momentCaptionText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowRadius: 4,
    lineHeight: 20,
  },

  // ── Action Buttons (right side) ──
  momentActions: {
    position: "absolute",
    bottom: 16,
    right: 16,
    alignItems: "center",
    gap: 12,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  actionBtnText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.7)",
    marginTop: 2,
    fontWeight: "600",
    textAlign: "center",
  },
  deleteBtn: {
    backgroundColor: "rgba(239, 68, 68, 0.3)",
    borderColor: "rgba(239, 68, 68, 0.5)",
  },

  // ── Empty State ──
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    textAlign: "center",
    lineHeight: 22,
  },

  // ── Loading ──
  loadingContainer: {
    padding: 20,
    alignItems: "center",
  },
});

// Styles Modal báo cáo
export const reportModalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#1f2937",
    borderRadius: 16,
    padding: 20,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 16,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#00C2FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#00C2FF",
  },
  radioText: {
    fontSize: 15,
    color: "#e5e7eb",
  },
  textInput: {
    backgroundColor: "#374151",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    height: 80,
    textAlignVertical: "top",
    marginTop: 8,
    marginBottom: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 12,
  },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  btnCancel: {
    backgroundColor: "#374151",
  },
  btnSubmit: {
    backgroundColor: "#EF4444",
  },
  btnTextCancel: {
    color: "#fff",
    fontWeight: "600",
  },
  btnTextSubmit: {
    color: "#fff",
    fontWeight: "600",
  },
});