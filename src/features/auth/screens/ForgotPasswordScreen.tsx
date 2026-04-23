import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { authApi } from "@/services/authApi";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { COLORS, styles } from "./ForgotPasswordScreen.styles";

export const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const handleSendOtp = async () => {
    if (!email) {
      showMessage("Lỗi", "Vui lòng nhập email của bạn");
      return;
    }

    try {
      setIsLoading(true);
      const response: any = await authApi.forgotPassword(email);

      if (response.success) {
        showMessage("Thành công", "Mã xác nhận đã được gửi đến email của bạn");

        router.push({
          pathname: "/(auth)/verify-email",
          params: { email, action: "reset" },
        });
      }
    } catch (error: any) {
      showMessage("Lỗi", error.toString());
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
