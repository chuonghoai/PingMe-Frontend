import { Dimensions, Platform, StyleSheet } from "react-native";
import { PINGME_COLORS } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const VIEWFINDER_MARGIN = 16;
const VIEWFINDER_SIZE = SCREEN_WIDTH - VIEWFINDER_MARGIN * 2;
const VIEWFINDER_RADIUS = 32;

export const MOMENT_CONSTANTS = {
  VIEWFINDER_SIZE,
  VIEWFINDER_RADIUS,
  VIEWFINDER_MARGIN,
};

export const momentCameraStyles = StyleSheet.create({
  // ── Root container ──
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    flexGrow: 1,
  },

  // ── Close button (top-left) ──
  closeBtn: {
    position: "absolute",
    top: 0,
    left: 16,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30,
  },

  // ── Viewfinder Section ──
  viewfinderSection: {
    alignItems: "center",
    paddingHorizontal: VIEWFINDER_MARGIN,
  },
  viewfinderFrame: {
    width: VIEWFINDER_SIZE,
    height: VIEWFINDER_SIZE * 1.15,
    borderRadius: VIEWFINDER_RADIUS,
    backgroundColor: "#1A1A1A",
    overflow: "hidden",
    position: "relative",
  },
  viewfinderImage: {
    width: "100%",
    height: "100%",
    borderRadius: VIEWFINDER_RADIUS,
  },
  viewfinderPlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  viewfinderPlaceholderIcon: {
    fontSize: 56,
    marginBottom: 12,
  },
  viewfinderPlaceholderText: {
    fontSize: 15,
    color: "rgba(255,255,255,0.4)",
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },

  // ── Viewfinder overlay buttons (flash & zoom) ──
  viewfinderTopLeft: {
    position: "absolute",
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  viewfinderTopRight: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 5,
  },
  viewfinderBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },

  // ── Caption overlay on viewfinder ──
  captionOverlay: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    zIndex: 5,
  },
  captionInput: {
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: "#fff",
    fontWeight: "500",
    maxHeight: 70,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
    ...(Platform.OS === "web" ? ({ outlineStyle: "none" } as any) : {}),
  },

  // ── Controls Row (below viewfinder) ──
  controlsContainer: {
    alignItems: "center",
    paddingTop: 24,
    paddingBottom: 8,
  },
  controlsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 50,
  },

  // ── Gallery button (left) ──
  galleryBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  // ── Capture Button (center, gold ring) ──
  captureBtn: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 4,
    borderColor: "#FBBF24",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  captureBtnInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
  },

  // ── Flip Camera button (right) ──
  flipBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },

  // ── Post button (replaces capture after photo taken) ──
  postBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: "#FBBF24",
    backgroundColor: "#FBBF24",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FBBF24",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
  },
  retakeBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },

  // ── History / Feed Section ──
  historySection: {
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
  },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  historyAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.3)",
    marginRight: 8,
  },
  historyText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
  },
  historyChevron: {
    marginLeft: 4,
  },

  // ── Feed Item (same viewfinder frame for old moments) ──
  feedSection: {
    paddingHorizontal: VIEWFINDER_MARGIN,
    paddingBottom: 20,
  },
  feedSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(255,255,255,0.5)",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
  feedItem: {
    marginBottom: 20,
    borderRadius: VIEWFINDER_RADIUS,
    overflow: "hidden",
    backgroundColor: "#1A1A1A",
  },
  feedItemImage: {
    width: "100%",
    height: VIEWFINDER_SIZE * 1.15,
    borderRadius: VIEWFINDER_RADIUS,
  },
  feedItemOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderBottomLeftRadius: VIEWFINDER_RADIUS,
    borderBottomRightRadius: VIEWFINDER_RADIUS,
  },
  feedItemUserRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  feedItemAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#FBBF24",
    marginRight: 8,
  },
  feedItemName: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
    flex: 1,
  },
  feedItemTime: {
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
    fontWeight: "500",
  },
  feedItemCaption: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
    marginTop: 2,
  },
  feedItemActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  feedItemAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Loading Overlay ──
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
    borderRadius: 0,
  },
  loadingText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginTop: 16,
    letterSpacing: 0.5,
  },

  // ── Empty feed ──
  emptyFeed: {
    alignItems: "center",
    paddingVertical: 30,
  },
  emptyFeedText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.3)",
    fontWeight: "500",
  },
});
