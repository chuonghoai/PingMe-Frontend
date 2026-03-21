import { authApi } from "@/src/services/authApi";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Text, View } from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
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
      showMessage("Loi", "Vui long nhap email cua ban");
      return;
    }

    try {
      setIsLoading(true);
      const response: any = await authApi.forgotPassword(email);

      if (response.success) {
        showMessage("Thanh cong", "Ma xac nhan da duoc gui den email cua ban");

        router.push({
          pathname: "/(auth)/verify-email",
          params: { email, action: "reset" },
        });
      }
    } catch (error: any) {
      showMessage("Loi", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quen mat khau?</Text>
      <Text style={styles.subtitle}>
        Nhap email da dang ky cua ban de nhan ma xac thuc dat lai mat khau.
      </Text>

      <Input
        label="Email"
        placeholder="Nhap email cua ban"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <Button
        title={isLoading ? "Dang gui..." : "Gui ma xac nhan"}
        onPress={handleSendOtp}
        disabled={isLoading}
        style={{ marginTop: 20, backgroundColor: COLORS.amberGold }}
      />

      <Button
        title="Quay lai Dang nhap"
        variant="outline"
        onPress={() => router.back()}
        style={{ marginTop: 15, borderColor: COLORS.amberGold }}
      />
    </View>
  );
};
