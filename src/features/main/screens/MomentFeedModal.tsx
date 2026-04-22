import { LinearGradient } from "expo-linear-gradient";
import { MoreVertical, Navigation, Trash2, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { momentsApi } from "@/services/momentsApi";
import { useUser } from "@/store/UserContext";
import { momentFeedStyles as styles } from "./MomentFeedModal.styles";

interface MomentItem {
  id: string;
  userId: string;
  fullName: string;
  avatarUrl: string;
  imageUrl: string;
  caption: string | null;
  latitude: number;
  longitude: number;
  createdAt: string;
  isMine?: boolean;
}

const REPORT_REASONS = [
  { id: "SPAM", label: "Spam hoặc lừa đảo" },
  { id: "NUDITY", label: "Nội dung nhạy cảm / tình dục" },
  { id: "VIOLENCE", label: "Bạo lực hoặc nguy hiểm" },
  { id: "OTHER", label: "Khác" },
];

interface MomentFeedModalProps {
  visible: boolean;
  mode: "global" | "local";
  localCoord?: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onNavigateToLocation: (lat: number, lng: number) => void;
}

export const MomentFeedModal = ({
  visible,
  mode,
  localCoord,
  onClose,
  onNavigateToLocation,
}: MomentFeedModalProps) => {
  const insets = useSafeAreaInsets();
  const { userProfile } = useUser();

  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Report States
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [momentIdToReport, setMomentIdToReport] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState("SPAM");
  const [reportDescription, setReportDescription] = useState("");

  const fetchMoments = useCallback(async (pageNum = 1, append = false) => {
    try {
      pageNum === 1 ? setIsLoading(true) : setIsLoadingMore(true);
      let res: any = mode === "global"
        ? await momentsApi.getGlobalFeed(pageNum)
        : await momentsApi.getLocalFeed(localCoord!.latitude, localCoord!.longitude, pageNum);

      if (res?.success) {
        setMoments(prev => append ? [...prev, ...res.data.moments] : res.data.moments);
        setHasMore(res.data.hasMore);
        setPage(pageNum);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [mode, localCoord]);

  useEffect(() => { if (visible) fetchMoments(1, false); }, [visible, mode]);

  const handleOptionsClick = (momentId: string) => {
    Alert.alert("Tùy chọn", "Chọn hành động", [
      {
        text: "Báo cáo vi phạm", style: "destructive", onPress: () => {
          setMomentIdToReport(momentId);
          setReportModalVisible(true);
        }
      },
      { text: "Hủy", style: "cancel" }
    ]);
  };

  const submitReport = async () => {
    if (selectedReason === "OTHER" && !reportDescription.trim()) return Alert.alert("Lỗi", "Vui lòng nhập lý do.");
    try {
      await momentsApi.reportMoment(momentIdToReport!, selectedReason, reportDescription);
      setReportModalVisible(false);
      Alert.alert("Thành công", "Cảm ơn bạn đã báo cáo.");
    } catch (e) { Alert.alert("Lỗi", "Không thể gửi báo cáo."); }
  };

  const renderMomentItem = ({ item }: { item: MomentItem }) => {
    const isMine = item.userId === userProfile?.userId;
    return (
      <View style={styles.momentCard}>
        <View style={styles.momentImageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.momentImage} />
          <LinearGradient colors={["rgba(0,0,0,0.4)", "transparent"]} style={styles.momentGradientTop} />
          <LinearGradient colors={["transparent", "rgba(0,0,0,0.7)"]} style={styles.momentGradientBottom} />

          <View style={styles.momentUserRow}>
            <Image source={{ uri: item.avatarUrl || "https://ui-avatars.com/api/?name=U" }} style={styles.momentAvatar} />
            <View style={styles.momentUserInfo}>
              <Text style={styles.momentUserName}>{item.fullName}</Text>
              <Text style={styles.momentTimeText}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
          </View>

          <View style={styles.momentActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => { onClose(); onNavigateToLocation(item.latitude, item.longitude); }}>
              <Navigation size={18} color="#fff" />
            </TouchableOpacity>
            {isMine ? (
              <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => Alert.alert("Xóa?", "", [{ text: "Xóa", onPress: () => momentsApi.deleteMoment(item.id) }])}>
                <Trash2 size={18} color="#EF4444" />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleOptionsClick(item.id)}>
                <MoreVertical size={18} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
          <TouchableOpacity onPress={onClose}><X size={22} color="#fff" /></TouchableOpacity>
          <Text style={styles.headerTitle}>{mode === "global" ? "Feed" : "Tại đây"}</Text>
          <View style={{ width: 22 }} />
        </View>

        <FlatList
          data={moments}
          renderItem={renderMomentItem}
          onEndReached={() => hasMore && fetchMoments(page + 1, true)}
          contentContainerStyle={{ paddingTop: insets.top + 60 }}
        />

        <Modal visible={reportModalVisible} transparent animationType="fade">
          <KeyboardAvoidingView style={localStyles.overlay} behavior="padding">
            <View style={localStyles.content}>
              <Text style={localStyles.title}>Báo cáo</Text>
              {REPORT_REASONS.map(r => (
                <TouchableOpacity key={r.id} style={localStyles.option} onPress={() => setSelectedReason(r.id)}>
                  <View style={[localStyles.circle, selectedReason === r.id && localStyles.activeCircle]} />
                  <Text style={{ color: "#fff" }}>{r.label}</Text>
                </TouchableOpacity>
              ))}
              {selectedReason === "OTHER" && <TextInput style={localStyles.input} multiline onChangeText={setReportDescription} />}
              <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 10 }}>
                <TouchableOpacity onPress={() => setReportModalVisible(false)}><Text style={{ color: "#9ca3af" }}>Hủy</Text></TouchableOpacity>
                <TouchableOpacity onPress={submitReport}><Text style={{ color: "#EF4444" }}>Gửi</Text></TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    </Modal >
  );
};

const localStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", padding: 20 },
  content: { backgroundColor: "#1f2937", borderRadius: 16, padding: 20 },
  title: { color: "#fff", fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  option: { flexDirection: "row", alignItems: "center", marginBottom: 15 },
  circle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: "#00C2FF", marginRight: 10 },
  activeCircle: { backgroundColor: "#00C2FF" },
  input: { backgroundColor: "#374151", color: "#fff", borderRadius: 8, padding: 10, height: 60, marginTop: 5 }
});