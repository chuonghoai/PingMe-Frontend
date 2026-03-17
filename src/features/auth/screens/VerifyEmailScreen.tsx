import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";

// Nạp Styles và Bảng màu từ file bên ngoài vào
import { authApi } from "@/src/services/authApi";
import { COLORS, styles } from "./VerifyEmailScreen.styles";

export const VerifyEmailScreen = () => {
  const router = useRouter();
  // Lấy email được truyền từ màn hình Register sang (nếu có)
  const { email } = useLocalSearchParams<{ email: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleVerify = () => {
    if (otp.length < 4) {
      return;
    }
    router.replace("/(onboarding)/profile-setup");
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      setIsLoading(true);
      const response: any = await authApi.sendOtp(email);
      if (response.success)
        Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn");
    } catch (error: any) {
      Alert.alert("Lỗi", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Khối Logo GoGo đồng bộ */}
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <Text style={styles.logoTextMain}>Go</Text>
          <Text style={styles.logoTextSecondary}>Go</Text>
        </View>
      </View>

      <Text style={styles.icon}>✉️</Text>
      <Text style={styles.title}>Xác thực Email</Text>

      <Text style={styles.subtitle}>
        Chúng tôi đã gửi một mã xác thực gồm 6 chữ số đến email{"\n"}
        <Text style={styles.highlightEmail}>{email || "của bạn"}</Text>
      </Text>

      <Input
        label="Mã OTP"
        placeholder="Nhập mã xác thực"
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        style={{ textAlign: "center", fontSize: 20, letterSpacing: 5 }}
      />

      <Button
        title="Xác thực"
        onPress={handleVerify}
        style={{ marginTop: 20, backgroundColor: COLORS.amberGold }}
      />

      <View style={styles.resendContainer}>
        <Text style={styles.resendText}>Chưa nhận được mã? </Text>
        <TouchableOpacity onPress={handleResendOtp} disabled={isResending}>
          <Text style={[styles.resendLink, isResending && styles.disabledLink]}>
            {isResending ? "Đang gửi lại..." : "Gửi lại mã"}
          </Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Quay lại Đăng nhập"
        variant="outline"
        onPress={() => router.replace("/(auth)/login")}
        style={{ marginTop: 40, borderColor: COLORS.amberGold }}
      />
    </View>
  );
};
