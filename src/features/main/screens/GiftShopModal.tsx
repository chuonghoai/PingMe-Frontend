import React, { useEffect, useState, useCallback } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Alert,
} from "react-native";
import { X, Send } from "lucide-react-native";
import { getInventory, sendGift } from "@/services/challengesApi";
import { PINGME_COLORS } from "@/constants/theme";

interface InventoryItem {
  itemType: string;
  name: string;
  emoji: string;
  category: "GIFT" | "SPECIAL";
  quantity: number;
  description: string;
  intimacyBonus: number;
}

interface Props {
  isVisible: boolean;
  onClose: () => void;
  targetFriendId: string;
  targetFriendName: string;
}

export const GiftShopModal: React.FC<Props> = ({
  isVisible,
  onClose,
  targetFriendId,
  targetFriendName,
}) => {
  const [giftItems, setGiftItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingItem, setSendingItem] = useState<string | null>(null);

  const fetchGifts = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await getInventory();
      if (res?.success && res.data) {
        setGiftItems(res.data.filter((i: InventoryItem) => i.category === "GIFT"));
      }
    } catch (e) {
      console.log("[GiftShop] Error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isVisible) fetchGifts();
  }, [isVisible]);

  const handleSendGift = (item: InventoryItem) => {
    Alert.alert(
      `Tặng ${item.emoji} ${item.name}?`,
      `Tặng cho ${targetFriendName}\n+${item.intimacyBonus} điểm thân mật`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Tặng ngay!",
          onPress: async () => {
            try {
              setSendingItem(item.itemType);
              const res: any = await sendGift(targetFriendId, item.itemType);
              if (res?.success) {
                alert(`🎉 Đã tặng ${item.emoji} ${item.name} cho ${targetFriendName}!`);
                await fetchGifts();
              }
            } catch (e: any) {
              alert(e?.message || "Không thể tặng quà");
            } finally {
              setSendingItem(null);
            }
          },
        },
      ]
    );
  };

  return (
    <Modal visible={isVisible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Text style={{ fontSize: 22 }}>🎁</Text>
              <View style={{ marginLeft: 10 }}>
                <Text style={s.headerTitle}>Tặng quà</Text>
                <Text style={s.headerSubtitle}>cho {targetFriendName}</Text>
              </View>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={PINGME_COLORS.primary} style={{ marginTop: 40 }} />
          ) : giftItems.length === 0 ? (
            <View style={s.emptyContainer}>
              <Text style={s.emptyEmoji}>🎁</Text>
              <Text style={s.emptyText}>Chưa có quà để tặng</Text>
              <Text style={s.emptySubtext}>
                Hoàn thành Thử thách tình bạn để nhận quà!
              </Text>
            </View>
          ) : (
            <FlatList
              data={giftItems}
              keyExtractor={(item) => item.itemType}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={s.giftCard}
                  onPress={() => handleSendGift(item)}
                  disabled={sendingItem === item.itemType}
                  activeOpacity={0.8}
                >
                  <Text style={s.giftEmoji}>{item.emoji}</Text>
                  <View style={s.giftInfo}>
                    <Text style={s.giftName}>{item.name}</Text>
                    <Text style={s.giftBonus}>+{item.intimacyBonus} thân mật</Text>
                  </View>
                  <View style={s.giftRight}>
                    <Text style={s.giftQuantity}>x{item.quantity}</Text>
                    {sendingItem === item.itemType ? (
                      <ActivityIndicator size="small" color={PINGME_COLORS.primary} />
                    ) : (
                      <View style={s.sendBtn}>
                        <Send size={16} color="#fff" />
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              )}
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
    maxHeight: "65%",
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0F172A",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  giftCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFBEB",
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  giftEmoji: {
    fontSize: 36,
    marginRight: 14,
  },
  giftInfo: {
    flex: 1,
  },
  giftName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  giftBonus: {
    fontSize: 12,
    color: "#D97706",
    fontWeight: "600",
    marginTop: 2,
  },
  giftRight: {
    alignItems: "center",
    gap: 8,
  },
  giftQuantity: {
    fontSize: 14,
    fontWeight: "800",
    color: "#92400E",
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F43F5E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#F43F5E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#64748B",
  },
  emptySubtext: {
    fontSize: 13,
    color: "#94A3B8",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
