import { authApi } from "@/services/authApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
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
      showMessage("Loi", "Mat khau phai co it nhat 6 ky tu");
      return;
    }

    if (newPassword !== confirmPassword) {
      showMessage("Loi", "Mat khau nhap lai khong khop");
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
          "Thanh cong",
          "Dat lai mat khau thanh cong, vui long dang nhap lai",
        );
        router.replace("/(auth)/login");
      }
    } catch (error: any) {
      showMessage("Loi", error.toString());
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
      <Text style={styles.title}>Tao mat khau moi</Text>
      <Text style={styles.subtitle}>
        Vui long nhap mat khau moi cho tai khoan{" "}
        <Text style={{ fontWeight: "bold" }}>{email}</Text>
      </Text>

      <Input
        label="Mat khau moi"
        placeholder="Nhap mat khau moi"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      <Input
        label="Xac nhan mat khau"
        placeholder="Nhap lai mat khau moi"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      <Button
        title={isLoading ? "Dang xu ly..." : "Luu mat khau moi"}
        onPress={handleResetPassword}
        disabled={isLoading}
        style={{ marginTop: 20, backgroundColor: COLORS.amberGold }}
      />
    </View>
  );
};
