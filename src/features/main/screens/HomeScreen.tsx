import { useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Easing,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
// Thêm Search và Bell vào danh sách import
import { Bell, MapPin, MessageCircle, Search, User } from "lucide-react-native";

import { COLORS, styles } from "./HomeScreen.styles";

export const HomeScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const radarAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.08,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();

    Animated.loop(
      Animated.timing(radarAnim, {
        toValue: 1,
        duration: 2500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const radarScale = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 3],
  });
  const radarOpacity = radarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 0],
  });

  return (
    <View style={styles.container}>
      {/* --- 1. KHU VỰC BẢN ĐỒ VỚI HIỆU ỨNG RADAR --- */}
      <View style={styles.mapPlaceholder}>
        <Animated.View
          style={[
            styles.radarCircleBase,
            { width: 120, height: 120, borderRadius: 60 },
            { transform: [{ scale: radarScale }], opacity: radarOpacity },
          ]}
        />
        <View
          style={[
            styles.radarCircleBase,
            { width: 200, height: 200, borderRadius: 100, opacity: 0.3 },
          ]}
        />
        <View style={styles.mapIconContainer}>
          <MapPin size={40} color={COLORS.amberGold} strokeWidth={2.5} />
        </View>
        <Text style={styles.mapText}>Bản đồ bạn bè</Text>
        <Text style={styles.mapSubText}>Sẵn sàng tích hợp SDK Bản đồ</Text>
      </View>

      {/* --- 2. CỤM TOP BAR (Profile, Search, Notification) --- */}
      <View style={[styles.topBarContainer, { top: insets.top + 16 }]}>
        {/* Nút Profile (Trái) */}
        <TouchableOpacity
          style={styles.topRoundBtn}
          onPress={() => router.push("/(main)/profile")}
          activeOpacity={0.8}
        >
          <User size={26} color={COLORS.darkAmber} strokeWidth={2.5} />
        </TouchableOpacity>

        {/* Thanh Tìm Kiếm (Giữa) */}
        <View style={styles.searchBarWrapper}>
          <Search size={20} color={COLORS.textSub} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm bạn bè, địa điểm..."
            placeholderTextColor={COLORS.textSub}
          />
        </View>

        {/* Nút Thông Báo (Phải) */}
        <TouchableOpacity
          style={styles.topRoundBtn}
          onPress={() => alert("Mở thông báo")}
          activeOpacity={0.8}
        >
          <Bell size={24} color={COLORS.darkAmber} strokeWidth={2.5} />
          {/* Chấm đỏ báo có thông báo mới */}
          <View style={styles.notiDot} />
        </TouchableOpacity>
      </View>

      {/* --- 3. NÚT CHAT CÓ HIỆU ỨNG NHỊP TIM (Giữa dưới) --- */}
      <Animated.View
        style={[
          styles.floatingBtnWrapper,
          {
            bottom: insets.bottom + 24,
            alignSelf: "center",
            transform: [{ scale: pulseAnim }],
          },
        ]}
      >
        <TouchableOpacity
          style={styles.chatBtn}
          onPress={() => router.push("/(main)/chat")}
          activeOpacity={0.9}
        >
          <MessageCircle size={32} color={COLORS.white} strokeWidth={2} />
          <View style={styles.chatBadge}>
            <Text style={styles.chatBadgeText}>3</Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};
