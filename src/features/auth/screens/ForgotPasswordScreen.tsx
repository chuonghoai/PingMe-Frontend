import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";

// Nạp Styles và Bảng màu từ file bên ngoài vào
import { COLORS, styles } from "./ForgotPasswordScreen.styles";

export const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSendResetLink = () => {
    if (!email) {
      // Ở đây bạn có thể thêm logic validate email sau
      return;
    }
    // Mock API gọi gửi yêu cầu thành công
    setIsSubmitted(true);
  };

  const handleBackToLogin = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      {/* Khối Logo GoGo */}
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <Text style={styles.logoTextMain}>Go</Text>
          <Text style={styles.logoTextSecondary}>Go</Text>
        </View>
      </View>

      <Text style={styles.title}>Quên mật khẩu?</Text>

      {!isSubmitted ? (
        <>
          <Text style={styles.subtitle}>
            Vui lòng nhập địa chỉ email bạn đã sử dụng để đăng ký tài khoản.
            Chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.
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
            title="Gửi yêu cầu"
            onPress={handleSendResetLink}
            style={{ marginTop: 20, backgroundColor: COLORS.amberGold }} // Đổi nền nút sang màu Vàng
          />
        </>
      ) : (
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✅</Text>
          <Text style={styles.successTitle}>Đã gửi email!</Text>
          <Text style={styles.successText}>
            Vui lòng kiểm tra hộp thư đến của bạn (bao gồm cả thư mục Spam) và
            làm theo hướng dẫn để đặt lại mật khẩu.
          </Text>
        </View>
      )}

      <Button
        title="Quay lại Đăng nhập"
        variant="outline"
        onPress={handleBackToLogin}
        style={{
          marginTop: isSubmitted ? 40 : 16,
          borderColor: COLORS.amberGold, // Đổi viền nút sang màu Vàng
        }}
      />
    </View>
  );
};
