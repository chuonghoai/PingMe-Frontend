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

  // SỬA Ở ĐÂY: Hứng thêm biến `password` từ màn hình trước truyền sang
  const { email, password } = useLocalSearchParams<{
    email: string;
    password?: string;
  }>();

  const [isLoading, setIsLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleVerify = async () => {
    // 1. Kiểm tra đầu vào cơ bản
    if (!otp || otp.length < 4) {
      Alert.alert("Lỗi", "Vui lòng nhập mã OTP hợp lệ");
      return;
    }

    if (!password) {
      Alert.alert("Lỗi", "Không tìm thấy mật khẩu. Vui lòng đăng ký lại.");
      return;
    }

    // 2. Gọi API Register
    try {
      setIsLoading(true);
      const response: any = await authApi.register({
        email: email,
        otp: otp,
        password: password,
      });

      if (response.success) {
        Alert.alert("Thành công", "Đăng ký tài khoản thành công!");

        // 3. ĐIỀU HƯỚNG & TRUYỀN EMAIL: Chuyển sang bước tạo Profile kèm theo email
        router.replace({
          pathname: "/(onboarding)/profile-setup",
          params: { email: email },
        });
      }
    } catch (error: any) {
      Alert.alert("Đăng ký thất bại", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      const response: any = await authApi.sendOtp(email);
      if (response.success)
        Alert.alert("Thành công", "Mã OTP đã được gửi đến email của bạn");
    } catch (error: any) {
      Alert.alert("Lỗi", error.toString());
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

      {/* SỬA NÚT BẤM: Thêm trạng thái isLoading */}
      <Button
        title={isLoading ? "Đang xác thực..." : "Xác thực"}
        onPress={handleVerify}
        disabled={isLoading}
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
