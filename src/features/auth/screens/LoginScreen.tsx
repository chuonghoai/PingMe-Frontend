import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Platform, Switch, Text, TouchableOpacity, View } from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";

// Nạp Styles và Bảng màu từ file bên ngoài vào
import { COLORS, styles } from "./LoginScreen.styles";

export const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = () => {
    // Tạm thời mock thành công chuyển thẳng vào Home
    router.replace("/(main)/home");
  };

  return (
    <View style={styles.container}>
      {/* Khối Logo GoGo ở trên cùng */}
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <Text style={styles.logoTextMain}>Go</Text>
          <Text style={styles.logoTextSecondary}>Go</Text>
        </View>
      </View>

      <Text style={styles.title}>Đăng nhập</Text>

      <Input
        label="Email"
        placeholder="Nhập email của bạn"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Mật khẩu"
        placeholder="Nhập mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <View style={styles.row}>
        <View style={styles.rememberMe}>
          <Switch
            value={rememberMe}
            onValueChange={setRememberMe}
            trackColor={{ false: "#767577", true: COLORS.amberGold }}
            thumbColor={Platform.OS === "android" ? "#f4f3f4" : undefined}
          />
          <Text style={styles.rememberText}>Nhớ mật khẩu</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text style={styles.forgotText}>Quên mật khẩu?</Text>
        </TouchableOpacity>
      </View>

      <Button
        title="Đăng nhập"
        onPress={handleLogin}
        style={{ backgroundColor: COLORS.amberGold }}
      />
      <Button
        title="Chưa có tài khoản? Đăng ký ngay"
        variant="outline"
        onPress={() => router.push("/(auth)/register")}
        style={{ borderColor: COLORS.amberGold }}
      />
    </View>
  );
};
