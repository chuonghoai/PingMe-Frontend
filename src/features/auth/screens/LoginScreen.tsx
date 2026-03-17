import { authApi } from "@/src/services/authApi";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { COLORS, styles } from "./LoginScreen.styles";

export const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu");
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert("Lỗi", "Email không hợp lệ");
      window.alert("Email không hợp lệ");
      console.log("Email không hợp lệ");
      return;
    }

    try {
      setIsLoading(true);
      const response: any = await authApi.login({ email, password });
      console.log(response);

      if (response.success) {
        if (Platform.OS === "web") {
          localStorage.setItem("accessToken", response.data.accessToken);
          localStorage.setItem("refreshToken", response.data.refreshToken);
        } else {
          await SecureStore.setItem("accessToken", response.data.accessToken);
          await SecureStore.setItem("refreshToken", response.data.refreshToken);
        }

        Alert.alert("Thành công", "Đăng nhập thành công!");
        router.replace("/(main)/home");
      }
    } catch (error: any) {
      Alert.alert("Đăng nhập thất bại", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  // validate email
  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  return (
    <View style={styles.container}>
      {/* Khối Logo GoGo ở trên cùng */}
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <Text style={styles.logoTextMain}>Go</Text>
          <Text style={styles.logoTextSecondary}>Go</Text>
        </View>
      </View>

      <Text style={styles.title}>Đăng nhập</Text>

      <Input
        label="Email"
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.row}>
        <View style={styles.rememberMe}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: "#767577", true: COLORS.amberGold }}
            thumbColor={Platform.OS === "android" ? "#f4f3f4" : undefined}
          />
          <Text style={styles.rememberText}>Nhớ mật khẩu</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Đăng nhập"
        onPress={handleLogin}
        style={{ backgroundColor: COLORS.amberGold }}
      />
      <Button
        title="Chưa có tài khoản? Đăng ký ngay"
        variant="outline"
        onPress={() => router.push("/(auth)/register")}
        style={{ borderColor: COLORS.amberGold }}
      />
    </View>
  );
};
