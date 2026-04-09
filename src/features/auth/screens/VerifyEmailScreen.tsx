import { authApi } from "@/services/authApi";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Platform, Text, TouchableOpacity, View } from "react-native";
import { Button } from "@/components/Button/Button";
import { Input } from "@/components/Input/Input";
import { COLORS, styles } from "./VerifyEmailScreen.styles";

export const VerifyEmailScreen = () => {
  const router = useRouter();
  const { email, password, action } = useLocalSearchParams<{
    email: string;
    password?: string;
    action?: string;
  }>();

  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const handleVerify = async () => {
    if (!otp || otp.length < 4) {
      showMessage("Loi", "Vui long nhap ma OTP hop le");
      return;
    }

    if (action === "reset") {
      router.push({
        pathname: "/(auth)/reset-password",
        params: { email, otp },
      });
      return;
    }

    if (!password) {
      showMessage(
        "Loi",
        "Khong tim thay mat khau. Vui long quay lai man hinh dang ky.",
      );
      return;
    }

    try {
      setIsLoading(true);
      const response: any = await authApi.register({ email, otp, password });

      if (response.success) {
        showMessage("Thanh cong", "Dang ky tai khoan thanh cong!");
        router.replace({
          pathname: "/(onboarding)/profile-setup",
          params: { email },
        });
      }
    } catch (error: any) {
      showMessage("Dang ky that bai", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const res: any =
        action === "reset"
          ? await authApi.forgotPassword(email)
          : await authApi.sendOtp(email);

      if (res.success) {
        showMessage("Thanh cong", "Ma OTP da duoc gui lai");
      }
    } catch (error: any) {
      showMessage("Loi", error.toString());
    } finally {
      setIsResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <Text style={styles.logoTextMain}>Go</Text>
          <Text style={styles.logoTextSecondary}>Go</Text>
        </View>
      </View>

      <Text style={styles.icon}>Email</Text>
      <Text style={styles.title}>Xac thuc Email</Text>

      <Text style={styles.subtitle}>
        Chung toi da gui mot ma xac thuc gom 6 chu so den email{"\n"}
        <Text style={styles.highlightEmail}>{email || "cua ban"}</Text>
      </Text>

      <Input
        label="Ma OTP"
        placeholder="Nhap ma xac thuc"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        style={{ textAlign: "center", fontSize: 20, letterSpacing: 5 }}
      />

      <Button
        title={isLoading ? "Dang xac thuc..." : "Xac thuc"}
        onPress={handleVerify}
        disabled={isLoading}
        style={{ marginTop: 20, backgroundColor: COLORS.amberGold }}
      />

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Chua nhan duoc ma? </Text>
        <TouchableOpacity onPress={handleResendOtp} disabled={isResending}>
          <Text style={[styles.resendLink, isResending && styles.disabledLink]}>
            {isResending ? "Dang gui lai..." : "Gui lai ma"}
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Quay lai Dang nhap"
        variant="outline"
        onPress={() => router.replace("/(auth)/login")}
        style={{ marginTop: 40, borderColor: COLORS.amberGold }}
      />
    </View>
  );
};
