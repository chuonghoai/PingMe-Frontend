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
import { X, Package, Zap, Shield } from "lucide-react-native";
import { getInventory, useSpecialItem } from "@/services/challengesApi";
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
  visible: boolean;
  onClose: () => void;
}

export const InventoryModal: React.FC<Props> = ({ visible, onClose }) => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [usingItem, setUsingItem] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await getInventory();
      if (res?.success && res.data) {
        setItems(res.data);
      }
    } catch (e) {
      console.log("[Inventory] Error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (visible) fetchInventory();
  }, [visible]);

  const handleUseItem = (item: InventoryItem) => {
    Alert.alert(
      `Sử dụng ${item.emoji} ${item.name}?`,
      item.description,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Kích hoạt",
          onPress: async () => {
            try {
              setUsingItem(item.itemType);
              const res: any = await useSpecialItem(item.itemType);
              if (res?.success) {
                alert(`✅ Đã kích hoạt ${item.emoji} ${item.name}!`);
                await fetchInventory();
              }
            } catch (e: any) {
              alert(e?.message || "Không thể sử dụng vật phẩm");
            } finally {
              setUsingItem(null);
            }
          },
        },
      ]
    );
  };

  const giftItems = items.filter(i => i.category === "GIFT");
  const specialItems = items.filter(i => i.category === "SPECIAL");

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <View style={s.itemCard}>
      <View style={s.itemLeft}>
        <Text style={s.itemEmoji}>{item.emoji}</Text>
        <View style={s.itemInfo}>
          <Text style={s.itemName}>{item.name}</Text>
          <Text style={s.itemDesc}>{item.description}</Text>
        </View>
      </View>
      <View style={s.itemRight}>
        <View style={s.quantityBadge}>
          <Text style={s.quantityText}>x{item.quantity}</Text>
        </View>
        {item.category === "SPECIAL" && (
          <TouchableOpacity
            style={s.useBtn}
            onPress={() => handleUseItem(item)}
            disabled={usingItem === item.itemType}
            activeOpacity={0.8}
          >
            {usingItem === item.itemType ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={s.useBtnText}>Dùng</Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={s.overlay}>
        <View style={s.container}>
          {/* Header */}
          <View style={s.header}>
            <View style={s.headerLeft}>
              <Package size={22} color={PINGME_COLORS.primary} strokeWidth={2.5} />
              <Text style={s.headerTitle}>Kho đồ của tôi</Text>
            </View>
            <TouchableOpacity style={s.closeBtn} onPress={onClose}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={PINGME_COLORS.primary} style={{ marginTop: 40 }} />
          ) : items.length === 0 ? (
            <View style={s.emptyContainer}>
              <Text style={s.emptyEmoji}>📦</Text>
              <Text style={s.emptyText}>Kho đồ trống</Text>
              <Text style={s.emptySubtext}>Hoàn thành thử thách để nhận vật phẩm!</Text>
            </View>
          ) : (
            <FlatList
              data={[...specialItems, ...giftItems]}
              keyExtractor={(item) => item.itemType}
              renderItem={renderItem}
              contentContainerStyle={s.listContent}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={
                specialItems.length > 0 ? (
                  <View style={s.sectionHeader}>
                    <Zap size={16} color="#F59E0B" />
                    <Text style={s.sectionTitle}>Vật phẩm đặc biệt</Text>
                  </View>
                ) : null
              }
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
    maxHeight: "75%",
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
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
    marginLeft: 10,
  },
  closeBtn: {
    padding: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#92400E",
    letterSpacing: 0.5,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FAFBFC",
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  itemEmoji: {
    fontSize: 32,
    marginRight: 14,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  itemDesc: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 2,
  },
  itemRight: {
    alignItems: "center",
    gap: 8,
  },
  quantityBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  quantityText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#3B82F6",
  },
  useBtn: {
    backgroundColor: PINGME_COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  useBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 12,
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
  },
});
