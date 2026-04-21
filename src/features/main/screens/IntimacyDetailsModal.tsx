import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { X, Flame, MessageCircle, MapPin, Gift, Phone, Trophy, Star, Zap, TrendingUp } from "lucide-react-native";
import { PINGME_COLORS as COLORS } from "@/constants/theme";

// ── Aura Tier Config ──
const AURA_TIERS = [
  { key: "NONE", label: "Người quen", sublabel: "Thủy tinh", minLevel: 1, color: "#94A3B8", emoji: "🌱" },
  { key: "SILVER", label: "Bạn thân", sublabel: "Bạc", minLevel: 5, color: "#9CA3AF", emoji: "🛡️" },
  { key: "GOLD", label: "Khắng khít", sublabel: "Vàng", minLevel: 10, color: "#F59E0B", emoji: "⭐" },
  { key: "PLATINUM", label: "Tri kỷ", sublabel: "Bạch kim", minLevel: 20, color: "#06B6D4", emoji: "💎" },
  { key: "DIAMOND", label: "Ngoại hạng", sublabel: "Kim cương", minLevel: 50, color: "#8B5CF6", emoji: "👑" },
];

// ── Streak Milestones ──
const STREAK_MILESTONES = [
  { days: 3, label: "3 ngày", bonus: "x1.1", color: "#F59E0B" },
  { days: 7, label: "7 ngày", bonus: "x1.2", color: "#EF4444" },
  { days: 30, label: "30 ngày", bonus: "x1.5", color: "#8B5CF6" },
];

// ── Exp Guide Items ──
const EXP_GUIDE = [
  { icon: MessageCircle, label: "Nhắn tin cho nhau", points: "+1 điểm/tin nhắn", color: COLORS.primary },
  { icon: Phone, label: "Gọi điện / Video", points: "+5 điểm/cuộc gọi", color: "#10B981" },
  { icon: MapPin, label: "Ở gần nhau (< 50m)", points: "+5 điểm/lần", color: "#6366F1" },
  { icon: Gift, label: "Gửi quà tặng", points: "+10 điểm/quà", color: "#EC4899" },
  { icon: Flame, label: "Duy trì Streak hàng ngày", points: "Nhân hệ số điểm", color: "#F59E0B" },
];

interface IntimacyDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  friendName: string;
  rankData: {
    level: number;
    name: string;
    currentExp: number;
    nextLevelExp: number;
    progressPercent: number;
    currentStreak?: number;
    longestStreak?: number;
    aura?: string;
  } | null;
}

export const IntimacyDetailsModal: React.FC<IntimacyDetailsModalProps> = ({
  visible,
  onClose,
  friendName,
  rankData,
}) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible && rankData) {
      progressAnim.setValue(0);
      Animated.timing(progressAnim, {
        toValue: rankData.progressPercent,
        duration: 800,
        useNativeDriver: false,
      }).start();
    }
  }, [visible, rankData]);

  if (!rankData) return null;

  const currentTier = AURA_TIERS.slice().reverse().find(t => rankData.level >= t.minLevel) || AURA_TIERS[0];
  const expRemaining = Math.max(0, rankData.nextLevelExp - rankData.currentExp);
  const currentStreak = rankData.currentStreak || 0;

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.backdrop}>
        {/* Tap outside to close */}
        <Pressable style={s.backdropTouch} onPress={onClose} />

        {/* Modal Content */}
        <View style={s.container}>
          {/* Drag handle */}
          <View style={s.dragHandle} />

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={true}
            contentContainerStyle={{ paddingBottom: 40 }}
            style={{ maxHeight: Dimensions.get("window").height * 0.78 }}
          >
            {/* ═══════ HEADER CARD ═══════ */}
            <View style={[s.headerCard, { borderColor: currentTier.color }]}>
              <View style={s.headerContent}>
                {/* Tier Badge */}
                <View style={[s.tierBadge, { backgroundColor: currentTier.color + "20", borderColor: currentTier.color }]}>
                  <Text style={s.tierEmoji}>{currentTier.emoji}</Text>
                </View>

                <View style={s.headerTextWrap}>
                  <Text style={s.headerTitle}>Độ thân mật với</Text>
                  <Text style={s.headerName} numberOfLines={1}>{friendName}</Text>
                  <View style={[s.auraBadge, { backgroundColor: currentTier.color + "20" }]}>
                    <Text style={[s.auraLabel, { color: currentTier.color }]}>
                      {currentTier.emoji} {currentTier.label}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity style={s.closeBtn} onPress={onClose}>
                  <X size={20} color={COLORS.textSecondary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* ═══════ LEVEL & PROGRESS BAR ═══════ */}
            <View style={s.section}>
              <View style={s.levelRow}>
                <View style={s.levelBox}>
                  <Text style={s.levelLabel}>Cấp hiện tại</Text>
                  <Text style={[s.levelValue, { color: currentTier.color }]}>{rankData.level}</Text>
                </View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <View style={s.progressTrack}>
                    <Animated.View style={[s.progressFill, { width: progressWidth, backgroundColor: currentTier.color }]}>
                      <View style={s.progressShine} />
                    </Animated.View>
                  </View>
                  <Text style={s.expText}>
                    {rankData.currentExp} / {rankData.nextLevelExp} EXP
                  </Text>
                </View>
                <View style={s.levelBox}>
                  <Text style={s.levelLabel}>Cấp tiếp</Text>
                  <Text style={[s.levelValue, { color: COLORS.textMuted }]}>{rankData.level + 1}</Text>
                </View>
              </View>
              <View style={[s.expRemainingBadge, { backgroundColor: currentTier.color + "12" }]}>
                <TrendingUp size={14} color={currentTier.color} />
                <Text style={[s.expRemainingText, { color: currentTier.color }]}>
                  Còn {expRemaining} điểm để thăng cấp
                </Text>
              </View>
            </View>

            {/* ═══════ TIERS ROADMAP ═══════ */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Trophy size={18} color={COLORS.primary} />
                <Text style={s.sectionTitle}>Các mốc thân mật</Text>
              </View>
              <View style={s.tierRoadmap}>
                {AURA_TIERS.map((tier, i) => {
                  const isUnlocked = rankData.level >= tier.minLevel;
                  const isCurrent = tier.key === currentTier.key;
                  return (
                    <View key={tier.key} style={s.tierRow}>
                      {/* Connector Line */}
                      {i > 0 && (
                        <View style={[s.tierConnector, { backgroundColor: isUnlocked ? tier.color : "#E2E8F0" }]} />
                      )}
                      <View style={[
                        s.tierDot,
                        { backgroundColor: isUnlocked ? tier.color : "#E2E8F0", borderColor: isCurrent ? tier.color : "transparent" },
                        isCurrent && s.tierDotActive,
                      ]}>
                        <Text style={{ fontSize: 12 }}>{tier.emoji}</Text>
                      </View>
                      <View style={s.tierInfo}>
                        <Text style={[
                          s.tierName,
                          isUnlocked && { color: COLORS.textPrimary },
                          isCurrent && { fontWeight: "800" },
                        ]}>
                          {tier.label}
                        </Text>
                        <Text style={[s.tierMinLevel, isUnlocked && { color: tier.color }]}>
                          Lv.{tier.minLevel}+
                          {isCurrent && " ← Bạn đang ở đây"}
                        </Text>
                      </View>
                      {isUnlocked && (
                        <View style={[s.tierCheck, { backgroundColor: tier.color }]}>
                          <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "bold" }}>✓</Text>
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* ═══════ STREAK SECTION ═══════ */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Flame size={18} color="#F59E0B" />
                <Text style={s.sectionTitle}>Chuỗi thân mật</Text>
              </View>

              <View style={s.streakCard}>
                <View style={s.streakMainRow}>
                  <View style={[s.streakFireCircle, currentStreak >= 7 && { backgroundColor: "#FEF2F2" }]}>
                    <Text style={{ fontSize: 28 }}>{currentStreak >= 30 ? "🔥" : currentStreak >= 7 ? "🔥" : currentStreak >= 3 ? "✨" : "💤"}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={s.streakNumber}>{currentStreak} ngày liên tiếp</Text>
                    <Text style={s.streakSubtext}>
                      {currentStreak >= 30 ? "Hệ số nhân x1.5 🎉" : currentStreak >= 7 ? "Hệ số nhân x1.2 ⚡" : currentStreak >= 3 ? "Hệ số nhân x1.1 ✨" : "Nhắn tin mỗi ngày để kích hoạt Streak!"}
                    </Text>
                    {rankData.longestStreak ? (
                      <Text style={s.streakRecord}>Kỷ lục: {rankData.longestStreak} ngày 🏆</Text>
                    ) : null}
                  </View>
                </View>

                {/* Streak Milestones Bar */}
                <View style={s.streakMilestones}>
                  {STREAK_MILESTONES.map((ms, i) => {
                    const reached = currentStreak >= ms.days;
                    return (
                      <View key={ms.days} style={s.streakMilestone}>
                        <View style={[s.streakMilestoneDot, reached && { backgroundColor: ms.color }]}>
                          <Text style={{ fontSize: 8, color: reached ? "#FFF" : COLORS.textMuted, fontWeight: "bold" }}>{ms.bonus}</Text>
                        </View>
                        <Text style={[s.streakMilestoneLabel, reached && { color: ms.color, fontWeight: "700" }]}>{ms.label}</Text>
                        {i < STREAK_MILESTONES.length - 1 && (
                          <View style={[s.streakMilestoneLine, reached && { backgroundColor: ms.color }]} />
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* ═══════ HOW TO EARN EXP ═══════ */}
            <View style={s.section}>
              <View style={s.sectionHeader}>
                <Zap size={18} color="#EF4444" />
                <Text style={s.sectionTitle}>Cách kiếm điểm kinh nghiệm</Text>
              </View>

              {EXP_GUIDE.map((item, i) => {
                const IconComp = item.icon;
                return (
                  <View key={i} style={s.guideRow}>
                    <View style={[s.guideIconWrap, { backgroundColor: item.color + "15" }]}>
                      <IconComp size={18} color={item.color} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={s.guideLabel}>{item.label}</Text>
                      <Text style={s.guidePoints}>{item.points}</Text>
                    </View>
                  </View>
                );
              })}

              <View style={s.dailyCapNote}>
                <Star size={14} color={COLORS.warning} />
                <Text style={s.dailyCapText}>Giới hạn: Tối đa 150 điểm/ngày</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// ── Styles ──
const s = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  backdropTouch: {
    flex: 1,
  },
  container: {
    backgroundColor: COLORS.bgWhite,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 20,
  },
  dragHandle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 6,
  },

  // ── Header ──
  headerCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    marginTop: 8,
    marginBottom: 6,
    overflow: "hidden",
    backgroundColor: COLORS.bgSurface,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  tierBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  tierEmoji: {
    fontSize: 26,
  },
  headerTextWrap: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  headerName: {
    fontSize: 18,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginTop: 2,
  },
  auraBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
  },
  auraLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.bgMid,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Section ──
  section: {
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: COLORS.textPrimary,
    marginLeft: 8,
  },

  // ── Level & Progress ──
  levelRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  levelBox: {
    alignItems: "center",
    width: 50,
  },
  levelLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginBottom: 4,
  },
  levelValue: {
    fontSize: 24,
    fontWeight: "900",
  },
  progressTrack: {
    height: 14,
    borderRadius: 7,
    backgroundColor: "#F1F5F9",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  progressFill: {
    height: "100%",
    borderRadius: 7,
    overflow: "hidden",
  },
  progressShine: {
    position: "absolute",
    top: 1,
    left: 4,
    right: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(255,255,255,0.4)",
  },
  expText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 5,
  },
  expRemainingBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 10,
  },
  expRemainingText: {
    fontSize: 12,
    fontWeight: "700",
    marginLeft: 6,
  },

  // ── Tier Roadmap ──
  tierRoadmap: {},
  tierRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  tierConnector: {
    position: "absolute",
    left: 21,
    top: -8,
    width: 2,
    height: 16,
    borderRadius: 1,
  },
  tierDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  tierDotActive: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 3,
  },
  tierInfo: {
    flex: 1,
    marginLeft: 12,
  },
  tierName: {
    fontSize: 14,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  tierMinLevel: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: "500",
  },
  tierCheck: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Streak ──
  streakCard: {
    backgroundColor: COLORS.bgSurface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  streakMainRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  streakFireCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#FFFBEB",
    justifyContent: "center",
    alignItems: "center",
  },
  streakNumber: {
    fontSize: 18,
    fontWeight: "900",
    color: COLORS.textPrimary,
  },
  streakSubtext: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  streakRecord: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginTop: 4,
  },
  streakMilestones: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#FDE68A50",
  },
  streakMilestone: {
    alignItems: "center",
    flex: 1,
  },
  streakMilestoneDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  streakMilestoneLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: "500",
    marginTop: 4,
  },
  streakMilestoneLine: {
    position: "absolute",
    top: 16,
    right: -20,
    width: 40,
    height: 2,
    backgroundColor: "#E2E8F0",
    borderRadius: 1,
  },

  // ── Guide ──
  guideRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: COLORS.bgSurface,
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  guideIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  guideLabel: {
    fontSize: 14,
    fontWeight: "700",
    color: COLORS.textPrimary,
  },
  guidePoints: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: "500",
    marginTop: 2,
  },
  dailyCapNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#FFFBEB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  dailyCapText: {
    fontSize: 11,
    color: "#92400E",
    fontWeight: "600",
    marginLeft: 6,
  },
});
