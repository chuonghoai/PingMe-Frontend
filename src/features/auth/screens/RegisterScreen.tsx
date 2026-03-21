import { authApi } from "@/src/services/authApi";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { COLORS, styles } from "./RegisterScreen.styles";

export const RegisterScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const handleRegister = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      showMessage("Loi", "Vui long nhap day du thong tin!");
      return;
    }

    if (password !== confirmPassword) {
      showMessage("Loi", "Mat khau xac nhan khong khop. Vui long kiem tra lai!");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Loi", "Email khong hop le");
      console.log("Email khong hop le");
      return;
    }

    try {
      setIsLoading(true);
      const response: any = await authApi.sendOtp(email);

      if (response.success) {
        showMessage("Thanh cong", "Ma OTP da duoc gui den email cua ban");

        router.push({
          pathname: "/(auth)/verify-email",
          params: {
            email,
            password,
          },
        });
      }
    } catch (error: any) {
      showMessage("Loi", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.white }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.logoContainer}>
          <View style={styles.logoRow}>
            <Text style={styles.logoTextMain}>Go</Text>
            <Text style={styles.logoTextSecondary}>Go</Text>
          </View>
        </View>

        <Text style={styles.title}>Dang ky tai khoan</Text>

        <Input
          label="Email"
          placeholder="Nhap email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Input
          label="Mat khau"
          placeholder="Tao mat khau"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <Input
          label="Xac nhan mat khau"
          placeholder="Nhap lai mat khau"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <Button
          title={isLoading ? "Dang gui..." : "Tiep tuc"}
          onPress={handleRegister}
          style={{ marginTop: 20, backgroundColor: COLORS.amberGold }}
        />
        <Button
          title="Da co tai khoan? Dang nhap"
          variant="outline"
          onPress={() => router.back()}
          style={{ borderColor: COLORS.amberGold }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
