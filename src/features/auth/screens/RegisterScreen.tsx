import { authApi } from "@/services/authApi";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { COLORS, styles } from "./RegisterScreen.styles";

export const RegisterScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      return;
    }
    Alert.alert(title, message);
  };

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      showMessage("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Lỗi", "Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Lỗi", "Email không hợp lệ");
      return;
    }

    try {
      setIsLoading(true);
      const response: any = await authApi.sendOtp(email);

      if (response.success) {
        showMessage("Thành công", "Mã OTP đã được gửi đến email của bạn");

        router.push({
          pathname: "/(auth)/verify-email",
          params: {
            email,
            password,
          },
        });
      }
    } catch (error: any) {
      showMessage("Lỗi", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.bgWhite }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.logoRow}>
            <Text style={styles.logoTextMain}>Ping</Text>
            <Text style={styles.logoTextSecondary}>Me</Text>
          </View>
        </View>

        <View style={styles.titleWrapper}>
          <Text style={styles.title}>Đăng ký tài khoản</Text>
          <Text style={styles.subtitle}>Bắt đầu hành trình kết nối của bạn</Text>
        </View>

        <Input
          label="Email"
          placeholder="Nhap email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Mat khau"
          placeholder="Tao mat khau"
          value={password}
          onChangeText={setPassword}
          isPassword={true}
        />

        <Input
          label="Xac nhan mat khau"
          placeholder="Nhap lai mat khau"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isPassword={true}
        />

        <TouchableOpacity 
          style={styles.registerBtn} 
          onPress={handleRegister} 
          activeOpacity={0.8}
          disabled={isLoading}
        >
          <View style={{ alignItems: 'center' }}>
            <Text style={styles.registerBtnText}>{isLoading ? "ĐANG GỬI OTP..." : "TIẾP TỤC"}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.loginLinkWrapper}>
          <Text style={styles.loginTextPrefix}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginTextAction}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
