/* eslint-disable import/no-unresolved */
import { Input } from "@/components/Input/Input";
import { authApi } from "@/services/authApi";
import { useUser } from "@/store/UserContext";
import { setTokens } from "@/utils/tokenStorage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { COLORS, styles } from "./LoginScreen.styles";

export const LoginScreen = () => {
  const router = useRouter();
  const { updateUserProfile } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Loi", "Email khong hop le");
      console.log("Email khong hop le");
      return;
    }

    try {
      setIsLoading(true);
      const response: any = await authApi.login({ email, password, rememberMe });

      if (response.success) {
        await setTokens(response.data.accessToken, response.data.refreshToken);

        updateUserProfile({
          userId: response.data.user.userId,
          email: response.data.user.email,
        });

        showMessage("Thành công", "Đăng nhập thành công!");
        router.replace("/(main)/home");
      }
    } catch (error: any) {
      showMessage("Đăng nhập thất bại", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <Text style={styles.logoTextMain}>Ping</Text>
          <Text style={styles.logoTextSecondary}>Me</Text>
        </View>
      </View>

      <View style={styles.titleWrapper}>
        <Text style={styles.title}>Đăng nhập</Text>
        <Text style={styles.subtitle}>Chào mừng trở lại! Hãy kết nối nào.</Text>
      </View>

      <Input
        label="Email"
        placeholder="Nhap email cua ban"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Input
        label="Mat khau"
        placeholder="Nhap mat khau"
        value={password}
        onChangeText={setPassword}
        isPassword={true}
      />

      <View style={styles.row}>
        <View style={styles.rememberMe}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: "#CBD5E1", true: COLORS.primary }}
            thumbColor={Platform.OS === "android" ? "#F8FAFC" : undefined}
          />
          <Text style={styles.rememberText}>Nho mat khau</Text>
        </View>
        <TouchableOpacity onPress={() => router.push("/(auth)/forgot-password")}>
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={handleLogin}
        activeOpacity={0.8}
        disabled={isLoading}
      >
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.loginBtnText}>{isLoading ? "ĐANG ĐĂNG NHẬP..." : "ĐĂNG NHẬP"}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.registerBtnWrapper}>
        <Text style={styles.registerTextPrefix}>Chưa có tài khoản? </Text>
        <TouchableOpacity onPress={() => router.push("/(auth)/register")}>
          <Text style={styles.registerTextAction}>Đăng ký ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
