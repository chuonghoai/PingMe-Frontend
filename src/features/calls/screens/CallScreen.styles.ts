import { StyleSheet, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const COLORS = {
  background: "#1C1C1E",
  overlay: "rgba(0, 0, 0, 0.6)",
  white: "#FFFFFF",
  textSub: "#D1D1D6",
  danger: "#FF3B30",
  success: "#34C759",
  buttonBg: "rgba(255, 255, 255, 0.2)",
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  remoteVideoPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#2C2C2E",
    justifyContent: "center",
    alignItems: "center",
  },

  infoContainer: {
    position: "absolute",
    top: height * 0.15,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 10,
  },
  avatarBig: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  nameText: {
    fontSize: 28,
    fontWeight: "bold",
    color: COLORS.white,
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  statusText: {
    fontSize: 16,
    color: COLORS.textSub,
    letterSpacing: 1,
  },

  localVideoPlaceholder: {
    position: "absolute",
    top: 60,
    right: 20,
    width: 100,
    height: 150,
    backgroundColor: "#3A3A3C",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  localCamText: {
    color: COLORS.white,
    fontSize: 12,
  },

  controlsContainer: {
    position: "absolute",
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingHorizontal: 20,
    zIndex: 20,
  },
  controlBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.buttonBg,
    justifyContent: "center",
    alignItems: "center",
  },
  controlBtnActive: {
    backgroundColor: COLORS.white,
  },
  dangerBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.danger,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  successBtn: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: COLORS.success,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
  callActionText: {
    color: COLORS.white,
    marginTop: 8,
    fontSize: 14,
    fontWeight: "600",
  }
});