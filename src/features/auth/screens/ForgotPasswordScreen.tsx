// src/features/auth/screens/ForgotPasswordScreen.tsx
import { authApi } from "@/src/services/authApi";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, View } from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { COLORS, styles } from "./ForgotPasswordScreen.styles";

export const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email của bạn");
      return;
    }

    try {
      setIsLoading(true);
      console.log("Đang gửi email");
      const response: any = await authApi.forgotPassword(email);
      console.log("Backend da gui email");

      if (response.success) {
        Alert.alert("Thành công", "Mã xác nhận đã được gửi đến email của bạn");
        window.alert("Mã xác nhận đã được gửi đến email của bạn");

        router.push({
          pathname: "/(auth)/verify-email",
          params: { email: email, action: "reset" },
        });
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quên mật khẩu?</Text>
      <Text style={styles.subtitle}>
        Nhập email đã đăng ký của bạn để nhận mã xác thực đặt lại mật khẩu.
      </Text>

      <Input
        label="Email"
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button
        title={isLoading ? "Đang gửi..." : "Gửi mã xác nhận"}
        onPress={handleSendOtp}
        disabled={isLoading}
        style={{ marginTop: 20, backgroundColor: COLORS.amberGold }}
      />

      <Button
        title="Quay lại Đăng nhập"
        variant="outline"
        onPress={() => router.back()}
        style={{ marginTop: 15, borderColor: COLORS.amberGold }}
      />
    </View>
  );
};
