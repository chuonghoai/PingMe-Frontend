import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getFriendPopup } from "@/services/mapApi";
import { unfriend } from "@/services/friendsApi";
import { COLORS, styles } from "./FriendProfileScreen.styles";
import { ChevronLeft, Info, Calendar as CalendarIcon, User, Users, AlertTriangle, UserMinus, ChevronRight } from "lucide-react-native";

export const FriendProfileScreen = () => {
  const router = useRouter();
  const { targetUserId, conversationId, name } = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);

  useEffect(() => {
    if (targetUserId) {
      fetchFriendProfile();
    }
  }, [targetUserId]);

  const fetchFriendProfile = async () => {
    try {
      setIsLoading(true);
      const response: any = await getFriendPopup(targetUserId as string);
      if (response.success && response.data) {
        setProfileData(response.data);
      } else {
        Alert.alert("Lỗi", "Không thể tải hồ sơ bạn bè");
        router.back();
      }
    } catch (error) {
      console.log("Lỗi tải hồ sơ bạn bè:", error);
      Alert.alert("Lỗi", "Không thể tải hồ sơ bạn bè");
      router.back();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfriend = () => {
    Alert.alert(
      "Hủy kết bạn",
      `Bạn có chắc chắn muốn hủy kết bạn với ${profileData?.basicInfo?.fullName}?`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy kết bạn",
          style: "destructive",
          onPress: async () => {
            try {
              await unfriend(targetUserId as string);
              Alert.alert("Thành công", "Đã hủy kết bạn");
              router.replace("/(main)/home");
            } catch (err) {
              Alert.alert("Lỗi", "Không thể hủy kết bạn lúc này");
            }
          },
        },
      ]
    );
  };

  const handleReport = () => {
    Alert.alert("Báo cáo", "Tính năng báo cáo tài khoản đang được phát triển.");
  };

  if (isLoading || !profileData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const { basicInfo, relationship } = profileData;
  
  // Format Date of Birth
  let dobStr = "Không cung cấp";
  if (basicInfo.dob) {
    const dob = new Date(basicInfo.dob);
    dobStr = `${dob.getDate().toString().padStart(2, '0')}/${(dob.getMonth() + 1).toString().padStart(2, '0')}/${dob.getFullYear()}`;
  }

  // Format Gender
  let genderStr = "Không cung cấp";
  if (basicInfo.gender === "MALE") genderStr = "Nam";
  else if (basicInfo.gender === "FEMALE") genderStr = "Nữ";
  else if (basicInfo.gender === "OTHER") genderStr = "Khác";

  const isFriend = relationship?.status === "FRIEND";

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Background Header */}
      <View style={styles.headerBackground} />

      {/* Header Actions */}
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Phần 1: Avatar, Name, Bio */}
      <View style={styles.profileContent}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: basicInfo.avatarUrl || "https://cdn-icons-png.flaticon.com/512/3135/3135715.png" }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.name}>{basicInfo.fullName}</Text>
        <Text style={styles.bioValue}>
          {basicInfo.bio || "Người này chưa viết gì cho phần tiểu sử."}
        </Text>
      </View>

      {/* Phần 2: Thông tin cá nhân */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Thông tin cá nhân</Text>
        
        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <User size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabelText}>Họ và tên</Text>
          </View>
          <Text style={styles.infoValueText}>{basicInfo.fullName}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <Info size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabelText}>Giới tính</Text>
          </View>
          <Text style={styles.infoValueText}>{genderStr}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoLabelContainer}>
            <CalendarIcon size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabelText}>Ngày sinh</Text>
          </View>
          <Text style={styles.infoValueText}>{dobStr}</Text>
        </View>

        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <View style={styles.infoLabelContainer}>
            <Users size={20} color={COLORS.textSecondary} />
            <Text style={styles.infoLabelText}>Bạn chung</Text>
          </View>
          <Text style={styles.infoValueText}>{basicInfo.mutualFriends || 0} người</Text>
        </View>
      </View>

      {/* Phần 3: Hành động (Report, Unfriend) */}
      <View style={styles.cardContainer}>
        <Text style={styles.cardTitle}>Tùy chọn</Text>
        
        <TouchableOpacity style={styles.actionRow} onPress={handleReport}>
          <AlertTriangle size={20} color="#E1B12C" />
          <Text style={[styles.actionText, styles.warningText]}>Báo cáo tài khoản</Text>
        </TouchableOpacity>

        {isFriend && (
          <TouchableOpacity style={[styles.actionRow, { borderBottomWidth: 0 }]} onPress={handleUnfriend}>
            <UserMinus size={20} color={COLORS.danger} />
            <Text style={[styles.actionText, styles.dangerText]}>Hủy kết bạn</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};
