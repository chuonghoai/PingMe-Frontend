import { Dimensions, Platform, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");
const COLORS = {
    black: "#000000",
    white: "#FFFFFF",
    amberGold: "#F5A623",
    gray: "#888888",
    overlay: "rgba(0, 0, 0, 0.6)",
};

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.black,
    },
    header: {
        position: "absolute",
        top: Platform.OS === "ios" ? 50 : 20,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        zIndex: 10,
    },
    iconBtn: {
        padding: 10,
        backgroundColor: COLORS.overlay,
        borderRadius: 20,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    image: {
        width: width,
        height: height,
    },
    video: {
        width: width,
        height: height,
    },
    videoControls: {
        position: "absolute",
        bottom: Platform.OS === "ios" ? 40 : 20,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        zIndex: 10,
    },
    controlRow: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 40,
        marginBottom: 20,
    },
    controlBtn: {
        padding: 12,
        backgroundColor: COLORS.overlay,
        borderRadius: 30,
    },
    playBtn: {
        backgroundColor: COLORS.amberGold,
        padding: 16,
    },
    progressContainer: {
        height: 40,
        justifyContent: "center",
    },
    progressBarBg: {
        height: 6,
        backgroundColor: COLORS.gray,
        borderRadius: 3,
        overflow: "hidden",
    },
    progressBarFill: {
        height: "100%",
        backgroundColor: COLORS.amberGold,
    },
    timeRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 8,
    },
    timeText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: "500",
    },
    dropdownMenu: {
        position: "absolute",
        top: Platform.OS === "ios" ? 100 : 70,
        right: 16,
        backgroundColor: COLORS.white,
        borderRadius: 8,
        paddingVertical: 8,
        zIndex: 20,
        minWidth: 150,
    },
    menuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 12,
    },
    menuText: {
        fontSize: 16,
        color: COLORS.black,
        fontWeight: "500",
    },
});