import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, View, Dimensions } from "react-native";
import { socketService } from "@/websockets/socketService";
import { useUser } from "@/store/UserContext";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

export const GlobalGiftAnimation = () => {
  const { userProfile } = useUser();
  const [giftEvent, setGiftEvent] = useState<{
    itemEmoji: string;
    itemName: string;
    senderId: string;
    intimacyGained: number;
  } | null>(null);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const handleReceiveGift = (data: any) => {
      if (data.receiverId === userProfile?.userId) {
        setGiftEvent({
          itemEmoji: data.itemEmoji || "🎁",
          itemName: data.itemName || "Quà",
          senderId: data.senderId,
          intimacyGained: data.intimacyGained || 0,
        });
      }
    };

    socketService.on("receive_gift", handleReceiveGift);
    return () => {
      socketService.off("receive_gift", handleReceiveGift);
    };
  }, [userProfile?.userId]);

  useEffect(() => {
    if (!giftEvent) return;

    fadeAnim.setValue(0);
    scaleAnim.setValue(0.3);
    floatAnim.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(fadeAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, tension: 60, useNativeDriver: true }),
      Animated.timing(floatAnim, { toValue: -30, duration: 2900, useNativeDriver: true }),
    ]).start(() => {
      setGiftEvent(null);
    });
  }, [giftEvent]);

  if (!giftEvent) return null;

  return (
    <Animated.View
      style={[
        s.container,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: floatAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <View style={s.giftBox}>
        <Text style={s.emoji}>{giftEvent.itemEmoji}</Text>
        <Text style={s.title}>Bạn nhận được quà!</Text>
        <Text style={s.itemName}>{giftEvent.itemName}</Text>
        {giftEvent.intimacyGained > 0 && (
          <Text style={s.bonus}>+{giftEvent.intimacyGained} điểm thân mật 💛</Text>
        )}
      </View>
    </Animated.View>
  );
};

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  giftBox: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 28,
    paddingHorizontal: 40,
    paddingVertical: 32,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#FDE68A",
    shadowColor: "#F59E0B",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 20,
  },
  emoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: "900",
    color: "#0F172A",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#D97706",
    marginBottom: 8,
  },
  bonus: {
    fontSize: 14,
    fontWeight: "600",
    color: "#10B981",
    marginTop: 4,
  },
});
