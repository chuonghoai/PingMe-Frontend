import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useRef } from "react";
import { getAccessToken } from "@/utils/tokenStorage";
import {
  Animated,
  Dimensions,
  Easing,
  StyleSheet,
  Text,
  View,
} from "react-native";

const { height } = Dimensions.get("window");

// ── PingMe Retro-Electronic Color Palette ──
const COLORS = {
  white: "#FFFFFF",
  primary: "#00C2FF",
  secondary: "#8B5CF6",
  accent: "#10B981",
  bgDark: "#0A0E17",
  bgWhite: "#FFFFFF",
  bgMid: "#F1F5F9",
};

const CIRCLE_SIZE = height * 1.5;

export default function SplashScreen() {
  const router = useRouter();

  // Animation values
  const dropAnim = useRef(new Animated.Value(-height / 2 - 100)).current;
  const expandAnim = useRef(new Animated.Value(0.02)).current;
  const logoSlideAnim = useRef(new Animated.Value(50)).current;
  const logoOpacityAnim = useRef(new Animated.Value(0)).current;
  const lineWidthAnim = useRef(new Animated.Value(0)).current;
  const sloganOpacityAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Step 1: Neon drop falls from above
      Animated.timing(dropAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.bounce,
        useNativeDriver: true,
      }),

      // Step 2: Circle expands to fill screen
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),

      // Step 3: Logo + underline + slogan appear
      Animated.parallel([
        Animated.spring(logoSlideAnim, {
          toValue: 0,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacityAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(lineWidthAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.out(Easing.exp),
          useNativeDriver: false,
        }),
        Animated.timing(sloganOpacityAnim, {
          toValue: 1,
          duration: 800,
          delay: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Subtle neon glow pulse
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0.6,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navigate after 3.2s
    const timer = setTimeout(async () => {
      try {
        const token = await getAccessToken();
        if (token) {
          router.replace("/(main)/home" as any);
        } else {
          router.replace("/(auth)/login" as any);
        }
      } catch (error) {
        router.replace("/(auth)/login" as any);
      }
    }, 3200);

    return () => clearTimeout(timer);
  }, []);
  const interpolatedLineWidth = lineWidthAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 100],
  });

  return (
    <View style={splashStyles.container}>
      <StatusBar style="light" />

      {/* Neon Drop Burst */}
      <Animated.View
        style={[
          splashStyles.expandingCircle,
          {
            transform: [
              { translateY: dropAnim },
              { scale: expandAnim },
            ],
          },
        ]}
      />

      {/* Logo Content */}
      <Animated.View
        style={[
          splashStyles.contentWrapper,
          {
            opacity: logoOpacityAnim,
            transform: [{ translateY: logoSlideAnim }],
          },
        ]}
      >
        {/* Pixel decorative line */}
        <Animated.View style={[splashStyles.pixelDeco, { opacity: glowAnim }]}>
          <View style={splashStyles.pixelDot} />
          <View style={[splashStyles.pixelDot, { backgroundColor: COLORS.secondary }]} />
          <View style={splashStyles.pixelDot} />
          <View style={[splashStyles.pixelDot, { backgroundColor: COLORS.accent }]} />
          <View style={splashStyles.pixelDot} />
        </Animated.View>

        {/* Brand Name */}
        <View style={splashStyles.logoRow}>
          <Text style={splashStyles.logoTextMain}>Ping</Text>
          <Text style={splashStyles.logoTextSecondary}>Me</Text>
        </View>

        {/* Animated Underline */}
        <Animated.View
          style={[splashStyles.dynamicLine, { width: interpolatedLineWidth }]}
        />

        {/* Version pixel tag */}
        <View style={splashStyles.versionTag}>
          <Text style={splashStyles.versionText}>{"<"} v1.0 {">"}</Text>
        </View>

        {/* Slogan */}
        <Animated.Text
          style={[splashStyles.tagline, { opacity: sloganOpacityAnim }]}
        >
          KẾT NỐI · KHÁM PHÁ · KHOẢNH KHẮC
        </Animated.Text>

        {/* Bottom pixel decorative line */}
        <Animated.View style={[splashStyles.pixelDeco, { opacity: glowAnim, marginTop: 20 }]}>
          <View style={splashStyles.pixelDot} />
          <View style={[splashStyles.pixelDot, { backgroundColor: COLORS.accent }]} />
          <View style={splashStyles.pixelDot} />
          <View style={[splashStyles.pixelDot, { backgroundColor: COLORS.secondary }]} />
          <View style={splashStyles.pixelDot} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const splashStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  expandingCircle: {
    position: "absolute",
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: COLORS.bgWhite,
  },
  contentWrapper: {
    alignItems: "center",
    zIndex: 10,
  },
  pixelDeco: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 4,
  },
  pixelDot: {
    width: 6,
    height: 6,
    backgroundColor: COLORS.primary,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  logoTextMain: {
    fontSize: 64,
    fontWeight: "900",
    color: COLORS.primary,
    letterSpacing: -1,
    textShadowColor: "rgba(0, 194, 255, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  logoTextSecondary: {
    fontSize: 64,
    fontWeight: "900",
    color: COLORS.secondary,
    letterSpacing: -1,
    marginLeft: 2,
    textShadowColor: "rgba(139, 92, 246, 0.5)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  dynamicLine: {
    height: 4,
    backgroundColor: COLORS.primary,
    marginBottom: 12,
    alignSelf: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  versionTag: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "rgba(0, 194, 255, 0.3)",
    marginBottom: 14,
  },
  versionText: {
    fontSize: 10,
    color: COLORS.primary,
    fontWeight: "700",
    letterSpacing: 3,
  },
  tagline: {
    fontSize: 12,
    color: COLORS.secondary,
    fontWeight: "700",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
});
