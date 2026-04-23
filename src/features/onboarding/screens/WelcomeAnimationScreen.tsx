import { useUser } from "@/store/UserContext";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height, width } = Dimensions.get("window");

// ── PingMe Retro-Electronic Color Palette ──
const COLORS = {
  white: "#FFFFFF",
  primary: "#00C2FF", // Vibrant Cyan
  secondary: "#8B5CF6", // Vibrant Purple
  accent: "#10B981", // Neon Emerald Green
  bgDark: "#0A0E17", // Deep Space
  bgWhite: "#FFFFFF",
};

export const WelcomeAnimationScreen = () => {
  const router = useRouter();
  const { userProfile } = useUser();
  const userName = userProfile?.fullname || userProfile?.firstName || "bạn mới";

  // Animation values
  const bgOpacityAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0.5)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const slideUpAnim = useRef(new Animated.Value(50)).current;
  const particlesOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Sequence of animations
    Animated.sequence([
      // 1. Fade in the dark background
      Animated.timing(bgOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      // 2. Pop in the text and slide up
      Animated.parallel([
        Animated.spring(textScaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 50,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideUpAnim, {
          toValue: 0,
          duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      // 3. Fade in particle/decorative elements
      Animated.timing(particlesOpacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();

    // Navigate to home after 3.5 seconds
    const timer = setTimeout(() => {
      // Fade out before leaving
      Animated.timing(bgOpacityAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        router.replace("/(main)/home" as any);
      });
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Animated.View style={[styles.container, { opacity: bgOpacityAnim }]}>
      <StatusBar style="light" />

      {/* Decorative background shapes */}
      <Animated.View style={[styles.circlePrimary, { opacity: particlesOpacityAnim }]} />
      <Animated.View style={[styles.circleSecondary, { opacity: particlesOpacityAnim }]} />

      <Animated.View
        style={[
          styles.contentWrapper,
          {
            opacity: textOpacityAnim,
            transform: [{ scale: textScaleAnim }, { translateY: slideUpAnim }],
          },
        ]}
      >
        <Text style={styles.title}>PingMe xin chào,</Text>
        <Text style={styles.nameText}>{userName}!</Text>
        
        <View style={styles.underline} />

        <Animated.Text style={[styles.subtitle, { opacity: particlesOpacityAnim }]}>
          Hãy bắt đầu hành trình kết nối của bạn
        </Animated.Text>
      </Animated.View>
    </Animated.View>
  );
};

const CIRCLE_SIZE = width * 1.2;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.bgDark,
    justifyContent: "center",
    alignItems: "center",
  },
  contentWrapper: {
    alignItems: "center",
    zIndex: 10,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "600",
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: 8,
  },
  nameText: {
    fontSize: 42,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -1,
    textAlign: "center",
    textShadowColor: "rgba(0, 194, 255, 0.6)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  underline: {
    height: 3,
    width: 60,
    backgroundColor: COLORS.accent,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 2,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.secondary,
    fontWeight: "500",
    letterSpacing: 1,
    textAlign: "center",
  },
  circlePrimary: {
    position: "absolute",
    top: -CIRCLE_SIZE / 3,
    right: -CIRCLE_SIZE / 3,
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: "rgba(0, 194, 255, 0.05)",
  },
  circleSecondary: {
    position: "absolute",
    bottom: -CIRCLE_SIZE / 4,
    left: -CIRCLE_SIZE / 4,
    width: CIRCLE_SIZE * 0.8,
    height: CIRCLE_SIZE * 0.8,
    borderRadius: (CIRCLE_SIZE * 0.8) / 2,
    backgroundColor: "rgba(139, 92, 246, 0.05)",
  },
});
