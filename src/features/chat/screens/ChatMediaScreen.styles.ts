import { StyleSheet, Platform, Dimensions } from "react-native";
import { COLORS } from "./ChatProfileScreen.styles";

const windowWidth = Dimensions.get('window').width;
const itemSize = (windowWidth - 4) / 3; // 3 cột, khoảng cách 2px

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 16,
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
  listContent: {
    paddingBottom: 20,
  },
  mediaItem: {
    width: itemSize,
    height: itemSize,
    margin: 1, // Tạo khe hở lưới 2px
    backgroundColor: COLORS.bgDarker,
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
});