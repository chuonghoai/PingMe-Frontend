import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { authApi } from "@/services/authApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { COLORS, styles } from "./ForgotPasswordScreen.styles";

export const ResetPasswordScreen = () => {
  const router = useRouter();
  const { email, otp } = useLocalSearchParams<{ email: string; otp: string }>();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showMessage("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Lỗi", "Mật khẩu nhập lại không khớp");
      return;
    }

    try {
      setIsLoading(true);
      const response: any = await authApi.resetPassword({
        email,
        otp,
        newPassword,
      });

      if (response.success) {
        showMessage(
          "Thành công",
          "Đặt lại mật khẩu thành công, vui lòng đăng nhập lại",
        );
        router.replace("/(auth)/login");
      }
    } catch (error: any) {
      showMessage("Lỗi", error.toString());
      router.replace({
        pathname: "/(auth)/verify-email",
        params: { email, action: "reset" },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo mật khẩu mới</Text>
      <Text style={styles.subtitle}>
        Vui lòng nhập mật khẩu mới cho tài khoản{" "}
        <Text style={{ fontWeight: "bold" }}>{email}</Text>
      </Text>

      <Input
        label="Mật khẩu mới"
        placeholder="Nhập mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <Input
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu mới"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Button
        title={isLoading ? "Đang xử lý..." : "Lưu mật khẩu mới"}
        onPress={handleResetPassword}
        disabled={isLoading}
        style={{ marginTop: 20, backgroundColor: COLORS.amberGold }}
      />
    </View>
  );
};
