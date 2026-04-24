import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Animated,
  ActivityIndicator,
  StyleSheet,
  Dimensions,
} from "react-native";
import { X, Trophy, Gift, ChevronRight } from "lucide-react-native";
import { getChallenges, claimChallengeReward } from "@/services/challengesApi";
import { PINGME_COLORS } from "@/constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface ChallengeItem {
  id: string;
  challengeType: string;
  name: string;
  description: string;
  emoji: string;
  currentProgress: number;
  targetProgress: number;
  isCompleted: boolean;
  isClaimed: boolean;
  reward: {
    itemType: string;
    itemName: string;
    itemEmoji: string;
    quantity: number;
  };
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onOpenInventory: () => void;
}

export const ChallengesModal: React.FC<Props> = ({ visible, onClose, onOpenInventory }) => {
  const [challenges, setChallenges] = useState<ChallengeItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [claimedAnim] = useState(new Animated.Value(0));

  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await getChallenges();
      if (res?.success && res.data) {
        setChallenges(res.data);
      }
    } catch (e) {
      console.log("[Challenges] Error fetching:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) fetchChallenges();
  }, [visible]);

  const handleClaim = async (challengeId: string) => {
    try {
      setClaimingId(challengeId);
      const res: any = await claimChallengeReward(challengeId);
      if (res?.success) {
        Animated.sequence([
          Animated.timing(claimedAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(claimedAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
        ]).start();

        await fetchChallenges();
        alert(`🎉 Đã nhận ${res.data?.rewardQuantity}x ${res.data?.itemEmoji} ${res.data?.itemName}!`);
      }
    } catch (e: any) {
      alert(e?.message || "Không thể nhận phần thưởng");
    } finally {
      setClaimingId(null);
    }
  };

  const renderChallenge = ({ item }: { item: ChallengeItem }) => {
    const progress = Math.min(item.currentProgress / item.targetProgress, 1);
    const isClaimable = item.isCompleted && !item.isClaimed;

    return (
      <View style={[s.challengeCard, item.isClaimed && s.challengeCardClaimed]}>
        <View style={s.challengeHeader}>
          <Text style={s.challengeEmoji}>{item.emoji}</Text>
          <View style={s.challengeInfo}>
            <Text style={[s.challengeName, item.isClaimed && s.challengeNameClaimed]}>{item.name}</Text>
            <Text style={s.challengeDesc}>{item.description}</Text>
          </View>
          {item.isClaimed ? (
            <View style={s.claimedBadge}>
              <Text style={s.claimedText}>✓</Text>
            </View>
          ) : null}
        </View>

        {/* Progress bar */}
        <View style={s.progressContainer}>
          <View style={s.progressBg}>
            <Animated.View
              style={[
                s.progressFill,
                { width: `${Math.round(progress * 100)}%` as any },
                item.isCompleted && s.progressFillComplete,
              ]}
            />
          </View>
          <Text style={s.progressText}>
            {item.currentProgress}/{item.targetProgress}
          </Text>
        </View>

        {/* Reward & Claim button */}
        <View style={s.rewardRow}>
          <View style={s.rewardPreview}>
            <Text style={s.rewardEmoji}>{item.reward.itemEmoji}</Text>
            <Text style={s.rewardLabel}>
              {item.reward.itemName} x{item.reward.quantity}
            </Text>
          </View>

          {isClaimable ? (
            <TouchableOpacity
              style={s.claimBtn}
              onPress={() => handleClaim(item.id)}
              disabled={claimingId === item.id}
              activeOpacity={0.8}
            >
              {claimingId === item.id ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={s.claimBtnText}>Nhận thưởng</Text>
              )}
            </TouchableOpacity>
          ) : item.isClaimed ? (
            <View style={s.claimBtnDisabled}>
              <Text style={s.claimBtnDisabledText}>Đã nhận</Text>
            </View>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Trophy size={24} color="#F59E0B" strokeWidth={2.5} />
              <Text style={s.headerTitle}>Thử thách tình bạn</Text>
            </View>
            <View style={s.headerRight}>
              <TouchableOpacity style={s.inventoryBtn} onPress={onOpenInventory} activeOpacity={0.8}>
                <Gift size={18} color={PINGME_COLORS.primary} strokeWidth={2} />
                <Text style={s.inventoryBtnText}>Kho đồ</Text>
                <ChevronRight size={14} color={PINGME_COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                <X size={22} color="#64748B" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Subtitle */}
          <Text style={s.subtitle}>Hoàn thành thử thách để nhận quà tặng bạn bè</Text>

          {/* Challenge list */}
          {loading ? (
            <ActivityIndicator size="large" color={PINGME_COLORS.primary} style={{ marginTop: 40 }} />
          ) : (
            <FlatList
              data={challenges}
              keyExtractor={(item) => item.id}
              renderItem={renderChallenge}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "85%",
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginLeft: 10,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inventoryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4FF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  inventoryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: PINGME_COLORS.primary,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },
  subtitle: {
    fontSize: 13,
    color: "#94A3B8",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  challengeCard: {
    backgroundColor: "#FAFBFC",
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  challengeCardClaimed: {
    opacity: 0.6,
    backgroundColor: "#F8FAFC",
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  challengeEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  challengeNameClaimed: {
    textDecorationLine: "line-through",
    color: "#94A3B8",
  },
  challengeDesc: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  claimedBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#10B981",
    justifyContent: "center",
    alignItems: "center",
  },
  claimedText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  progressBg: {
    flex: 1,
    height: 8,
    backgroundColor: "#E2E8F0",
    borderRadius: 4,
    overflow: "hidden",
    marginRight: 10,
  },
  progressFill: {
    height: "100%",
    backgroundColor: PINGME_COLORS.primary,
    borderRadius: 4,
  },
  progressFillComplete: {
    backgroundColor: "#10B981",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748B",
    minWidth: 40,
    textAlign: "right",
  },
  rewardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rewardPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7ED",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FED7AA",
  },
  rewardEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  rewardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400E",
  },
  claimBtn: {
    backgroundColor: "#10B981",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  claimBtnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 13,
  },
  claimBtnDisabled: {
    backgroundColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
  },
  claimBtnDisabledText: {
    color: "#94A3B8",
    fontWeight: "700",
    fontSize: 13,
  },
});
