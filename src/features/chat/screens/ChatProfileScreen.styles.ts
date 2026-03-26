import { Platform, StyleSheet } from "react-native";
import { COLORS as RootColors } from "./ChatRoomScreen.styles";

export const COLORS = RootColors;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.lightYellow,
    },
    header: {
        flexDirection: "row",
        alignItems: "center",
        paddingTop: Platform.OS === "ios" ? 50 : 20,
        paddingBottom: 12,
        paddingHorizontal: 16,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    backBtn: {
        padding: 8,
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: COLORS.textMain,
    },
    profileSection: {
        alignItems: "center",
        paddingVertical: 30,
        backgroundColor: COLORS.white,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 16,
        backgroundColor: COLORS.inputBackground,
    },
    name: {
        fontSize: 24,
        fontWeight: "bold",
        color: COLORS.textMain,
        marginBottom: 20,
    },
    actionRow: {
        flexDirection: "row",
        justifyContent: "center",
        gap: 30,
    },
    actionBtn: {
        alignItems: "center",
        gap: 8,
    },
    actionIconBox: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.bgDarker,
        justifyContent: "center",
        alignItems: "center",
    },
    actionText: {
        fontSize: 12,
        color: COLORS.textMain,
        fontWeight: "600",
    },
    section: {
        marginTop: 12,
        backgroundColor: COLORS.white,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: COLORS.borderColor,
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: COLORS.textMain,
    },
    seeAllText: {
        fontSize: 14,
        color: COLORS.amberGold,
    },
    mediaGrid: {
        paddingHorizontal: 16,
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    mediaItem: {
        width: "23%", // Hiển thị 4 hình 1 hàng
        aspectRatio: 1,
        borderRadius: 8,
        backgroundColor: COLORS.bgDarker,
        overflow: "hidden",
    },
    mediaImage: {
        width: "100%",
        height: "100%",
    },
    optionsList: {
        marginTop: 12,
        backgroundColor: COLORS.white,
        borderTopWidth: 1,
        borderColor: COLORS.borderColor,
    },
    optionItem: {
        flexDirection: "row",
        alignItems: "center",
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.borderColor,
    },
    optionText: {
        fontSize: 16,
        color: COLORS.textMain,
        marginLeft: 12,
        flex: 1,
    },
    dangerText: {
        color: COLORS.errorRed,
    },
});