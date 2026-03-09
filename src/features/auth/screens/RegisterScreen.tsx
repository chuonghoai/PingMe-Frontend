import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";

// Nạp Styles và Bảng màu từ file bên ngoài vào
import { COLORS, styles } from "./RegisterScreen.styles";

export const RegisterScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegister = () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        "Lỗi",
        "Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại!",
      );
      return;
    }

    router.push({
      pathname: "/(auth)/verify-email",
      params: { email: email },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.white }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* Khối Logo GoGo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoRow}>
            <Text style={styles.logoTextMain}>Go</Text>
            <Text style={styles.logoTextSecondary}>Go</Text>
          </View>
        </View>

        <Text style={styles.title}>Đăng ký tài khoản</Text>

        <Input
          label="Email"
          placeholder="Nhập email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Mật khẩu"
          placeholder="Tạo mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Input
          label="Xác nhận mật khẩu"
          placeholder="Nhập lại mật khẩu"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        {/* Tùy chỉnh màu sắc nút bấm cho khớp tone vàng */}
        <Button
          title="Tiếp tục"
          onPress={handleRegister}
          style={{ marginTop: 20, backgroundColor: COLORS.amberGold }}
        />
        <Button
          title="Đã có tài khoản? Đăng nhập"
          variant="outline"
          onPress={() => router.back()}
          style={{ borderColor: COLORS.amberGold }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
