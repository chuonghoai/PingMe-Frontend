import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Search, X, Check, UserPlus, Clock } from "lucide-react-native";
import { styles, COLORS } from "./AddFriendModal.styles";
import { searchUsersGlobally } from "@/services/profileApi";
import {
  getFriendRequests,
  sendFriendRequest,
  respondFriendRequest,
  FriendRequestItemDto,
} from "@/services/friendsApi";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export const AddFriendModal: React.FC<Props> = ({ visible, onClose }) => {
  const [activeTab, setActiveTab] = useState<"SEARCH" | "REQUESTS">("SEARCH");
  
  // Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set());

  // Requests State
  const [pendingRequests, setPendingRequests] = useState<FriendRequestItemDto[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  useEffect(() => {
    if (visible && activeTab === "REQUESTS") {
      fetchRequests();
    }
  }, [visible, activeTab]);

  const fetchRequests = async () => {
    try {
      setIsLoadingRequests(true);
      const res: any = await getFriendRequests();
      // apiClient interceptor unwraps response.data, so res could be:
      // 1. { success: true, data: [...] } from backend
      // 2. Direct array if backend returns plain array
      if (Array.isArray(res)) {
        setPendingRequests(res);
      } else if (res?.success && Array.isArray(res.data)) {
        setPendingRequests(res.data);
      } else if (Array.isArray(res?.data)) {
        setPendingRequests(res.data);
      }
    } catch (e) {
      console.log("Fetch requests err:", e);
    } finally {
      setIsLoadingRequests(false);
    }
  };

  const handleSearch = async (text: string) => {
    setSearchQuery(text);
    if (text.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      setIsSearching(true);
      const res: any = await searchUsersGlobally(text);
      if (res.success && res.data) {
        setSearchResults(res.data);
      }
    } catch (error) {
      console.log("Search error", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = (userId: string, userName: string) => {
    Alert.alert(
      "Xác nhận",
      `Bạn có chắc sẽ gửi lời mời kết bạn đến ${userName} không?`,
      [
        {
          text: "Từ chối",
          style: "cancel",
        },
        {
          text: "Đồng ý",
          onPress: async () => {
            try {
              const res: any = await sendFriendRequest(userId);
              if (res.success) {
                Alert.alert("Thành công", "Đã gửi lời mời kết bạn");
                setSentRequests((prev) => new Set(prev).add(userId));
              } else {
                Alert.alert("Lỗi", res.message || "Không thể gửi lời mời.");
              }
            } catch (e: any) {
              Alert.alert("Lỗi", typeof e === 'string' ? e : (e?.message || "Đã xảy ra lỗi"));
            }
          },
        },
      ]
    );
  };

  const handleRespond = async (requestId: string, action: "ACCEPT" | "REJECT") => {
    try {
      const res: any = await respondFriendRequest(requestId, action);
      if (res.success) {
        setPendingRequests((prev) => prev.filter((r) => r.requestId !== requestId));
        Alert.alert("Thành công", action === "ACCEPT" ? "Đã chấp nhận kết bạn" : "Đã xóa lời mời");
      }
    } catch (e: any) {
      Alert.alert("Lỗi", typeof e === 'string' ? e : (e?.message || "Đã xảy ra lỗi"));
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <KeyboardAvoidingView 
        style={styles.modalOverlay} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Thêm bạn bè</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={24} color={COLORS.textPrimary} />
            </TouchableOpacity>
          </View>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "SEARCH" && styles.activeTab]}
              onPress={() => setActiveTab("SEARCH")}
            >
              <Text style={[styles.tabText, activeTab === "SEARCH" && styles.activeTabText]}>
                Tìm kiếm
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, activeTab === "REQUESTS" && styles.activeTab]}
              onPress={() => setActiveTab("REQUESTS")}
            >
               <Text style={[styles.tabText, activeTab === "REQUESTS" && styles.activeTabText]}>
                Lời mời ({pendingRequests.length || 0})
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tab Content */}
          {activeTab === "SEARCH" ? (
            <View style={styles.contentBody}>
              <View style={styles.searchBar}>
                <Search size={20} color={COLORS.textMuted} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Nhập tên hoặc email..."
                  placeholderTextColor={COLORS.textMuted}
                  value={searchQuery}
                  onChangeText={handleSearch}
                />
                {isSearching && <ActivityIndicator size="small" color={COLORS.primary} />}
              </View>

              <FlatList
                data={searchResults}
                keyExtractor={(item) => item.userId}
                contentContainerStyle={{ paddingVertical: 10 }}
                ListEmptyComponent={
                  searchQuery.trim().length > 1 && !isSearching ? (
                    <Text style={styles.emptyText}>Không tìm thấy người dùng nào.</Text>
                  ) : null
                }
                renderItem={({ item }) => (
                  <View style={styles.userItem}>
                    <Image 
                      source={{ uri: item.avatarUrl || `https://ui-avatars.com/api/?name=U&background= random` }}
                      style={styles.avatar}
                    />
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{item.fullName}</Text>
                      {item.isFriend && (
                        <Text style={{ fontSize: 12, color: COLORS.textMuted }}>Bạn bè</Text>
                      )}
                      {!item.isFriend && item.friendshipStatus === 'PENDING' && (
                        <Text style={{ fontSize: 12, color: COLORS.textMuted }}>Đã gửi lời mời</Text>
                      )}
                    </View>
                    {!item.isFriend && (
                      <TouchableOpacity 
                        style={[styles.actionBtn, (sentRequests.has(item.userId) || item.friendshipStatus === 'PENDING') && styles.actionBtnDisabled]}
                        onPress={() => handleSendRequest(item.userId, item.fullName)}
                        disabled={sentRequests.has(item.userId) || item.friendshipStatus === 'PENDING'}
                      >
                        {sentRequests.has(item.userId) || item.friendshipStatus === 'PENDING' ? (
                          <Check size={18} color={COLORS.textMuted} />
                        ) : (
                          <UserPlus size={18} color={COLORS.primary} />
                        )}
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              />
            </View>
          ) : (
            <View style={styles.contentBody}>
              {isLoadingRequests ? (
                <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }}/>
              ) : (
                <FlatList
                  data={pendingRequests}
                  keyExtractor={(item) => item.requestId}
                  contentContainerStyle={{ paddingVertical: 10 }}
                  ListEmptyComponent={<Text style={styles.emptyText}>Không có lời mời kết bạn nào.</Text>}
                  renderItem={({ item }) => (
                    <View style={styles.userItem}>
                      <Image 
                        source={{ uri: item.fromUser.avatarUrl || `https://ui-avatars.com/api/?name=U&background=random` }}
                        style={styles.avatar}
                      />
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{item.fromUser.fullName}</Text>
                        <Text style={styles.timeText}>Muốn kết bạn với bạn</Text>
                      </View>
                      <View style={styles.requestActions}>
                        <TouchableOpacity style={styles.acceptBtn} onPress={() => handleRespond(item.requestId, "ACCEPT")}>
                          <Check size={18} color="#fff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.rejectBtn} onPress={() => handleRespond(item.requestId, "REJECT")}>
                          <X size={18} color={COLORS.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              )}
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
