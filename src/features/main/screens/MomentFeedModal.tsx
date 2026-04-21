import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X, Navigation, Trash2 } from "lucide-react-native";
import { LinearGradient } from "expo-linear-gradient";

import { momentFeedStyles as styles } from "./MomentFeedModal.styles";
import { momentsApi } from "@/services/momentsApi";
import { useUser } from "@/store/UserContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

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

interface MomentFeedModalProps {
  visible: boolean;
  mode: "global" | "local";
  localCoord?: { latitude: number; longitude: number } | null;
  onClose: () => void;
  onNavigateToLocation: (lat: number, lng: number) => void;
}

// ── Time formatting helper ──
const formatTimeAgo = (dateStr: string) => {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;
  if (diffDay < 7) return `${diffDay} ngày trước`;
  return date.toLocaleDateString("vi-VN");
};

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

  // ── Fetch moments ──
  const fetchMoments = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      try {
        if (pageNum === 1) setIsLoading(true);
        else setIsLoadingMore(true);

        let res: any;
        if (mode === "global") {
          res = await momentsApi.getGlobalFeed(pageNum);
        } else if (localCoord) {
          res = await momentsApi.getLocalFeed(
            localCoord.latitude,
            localCoord.longitude,
            pageNum
          );
        }

        if (res?.success && res?.data) {
          const newMoments = res.data.moments || [];
          setMoments((prev) =>
            append ? [...prev, ...newMoments] : newMoments
          );
          setHasMore(res.data.hasMore || false);
          setPage(pageNum);
        }
      } catch (error) {
        console.log("[MomentFeed] Fetch error:", error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [mode, localCoord]
  );

  useEffect(() => {
    if (visible) {
      setMoments([]);
      setPage(1);
      setHasMore(true);
      fetchMoments(1, false);
    }
  }, [visible, mode]);

  // ── Load more ──
  const loadMore = () => {
    if (!isLoadingMore && hasMore) {
      fetchMoments(page + 1, true);
    }
  };

  // ── Delete Moment ──
  const handleDelete = (momentId: string) => {
    Alert.alert("Xóa khoảnh khắc", "Bạn có chắc muốn xóa khoảnh khắc này?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await momentsApi.deleteMoment(momentId);
            setMoments((prev) => prev.filter((m) => m.id !== momentId));
          } catch (error) {
            console.log("[MomentFeed] Delete error:", error);
            Alert.alert("Lỗi", "Không thể xóa khoảnh khắc");
          }
        },
      },
    ]);
  };

  // ── Navigate to location ──
  const handleGoToLocation = (lat: number, lng: number) => {
    onClose();
    setTimeout(() => onNavigateToLocation(lat, lng), 300);
  };

  if (!visible) return null;

  const renderMomentItem = ({ item }: { item: MomentItem }) => {
    const isMine = item.userId === userProfile?.userId;

    return (
      <View style={styles.momentCard}>
        <View style={styles.momentImageContainer}>
          <Image source={{ uri: item.imageUrl }} style={styles.momentImage} />

          {/* Gradient overlays */}
          <LinearGradient
            colors={["rgba(0,0,0,0.4)", "transparent"]}
            style={styles.momentGradientTop}
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.7)"]}
            style={styles.momentGradientBottom}
          />

          {/* User info */}
          <View style={styles.momentUserRow}>
            <Image
              source={{
                uri:
                  item.avatarUrl ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(
                    item.fullName?.charAt(0) || "U"
                  )}&background=8B5CF6&color=fff&size=128`,
              }}
              style={styles.momentAvatar}
            />
            <View style={styles.momentUserInfo}>
              <Text style={styles.momentUserName}>{item.fullName}</Text>
              <Text style={styles.momentTimeText}>
                {formatTimeAgo(item.createdAt)}
              </Text>
            </View>
          </View>

          {/* Caption */}
          {item.caption ? (
            <View style={styles.momentCaption}>
              <Text style={styles.momentCaptionText} numberOfLines={3}>
                {item.caption}
              </Text>
            </View>
          ) : null}

          {/* Action buttons (right side) */}
          <View style={styles.momentActions}>
            {/* Go to location */}
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => handleGoToLocation(item.latitude, item.longitude)}
              activeOpacity={0.7}
            >
              <Navigation size={18} color="#fff" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.actionBtnText}>Đi đến</Text>

            {/* Delete (only for own moments) */}
            {isMine && (
              <>
                <TouchableOpacity
                  style={[styles.actionBtn, styles.deleteBtn]}
                  onPress={() => handleDelete(item.id)}
                  activeOpacity={0.7}
                >
                  <Trash2 size={18} color="#EF4444" strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.actionBtnText}>Xóa</Text>
              </>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.overlay}>
      {/* ── Header ── */}
      <View style={[styles.header, { paddingTop: insets.top + 8, paddingBottom: 8 }]}>
        <TouchableOpacity style={styles.headerClose} onPress={onClose}>
          <X size={22} color="#fff" strokeWidth={2.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {mode === "global" ? "Feed Khoảnh Khắc" : "Khoảnh khắc tại đây"}
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* ── Feed List ── */}
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#00C2FF" />
        </View>
      ) : moments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📷</Text>
          <Text style={styles.emptyTitle}>
            {mode === "global"
              ? "Chưa có khoảnh khắc nào"
              : "Chưa có ảnh tại đây"}
          </Text>
          <Text style={styles.emptyText}>
            {mode === "global"
              ? "Hãy chụp khoảnh khắc đầu tiên và ghim lên bản đồ!"
              : "Chưa có ai chụp ảnh tại vị trí này."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={moments}
          keyExtractor={(item) => item.id}
          renderItem={renderMomentItem}
          contentContainerStyle={[
            styles.feedListContent,
            { paddingTop: insets.top + 60 },
          ]}
          style={styles.feedList}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMore}
          onEndReachedThreshold={0.3}
          ListFooterComponent={
            isLoadingMore ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#00C2FF" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
};
