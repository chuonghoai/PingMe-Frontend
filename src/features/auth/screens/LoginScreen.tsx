/* eslint-disable import/no-unresolved */
import { authApi } from "@/src/services/authApi";
import { useUser } from "@/src/store/UserContext";
import { getAccessToken, setTokens } from "@/src/utils/tokenStorage";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Platform,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Button } from "../../../components/Button/Button";
import { Input } from "../../../components/Input/Input";
import { COLORS, styles } from "./LoginScreen.styles";

export const LoginScreen = () => {
  const router = useRouter();
  const { updateUserProfile } = useUser();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const showMessage = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}: ${message}`);
      return;
    }

    Alert.alert(title, message);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showMessage("Loi", "Vui long nhap email va mat khau");
      return;
    }

    if (!isValidEmail(email)) {
      showMessage("Loi", "Email khong hop le");
      console.log("Email khong hop le");
      return;
    }

    try {
      setIsLoading(true);
      const response: any = await authApi.login({ email, password, rememberMe });
      console.log(response);

      if (response.success) {
        await setTokens(response.data.accessToken, response.data.refreshToken);

        updateUserProfile({
          userId: response.data.user.userId,
          email: response.data.user.email,
        });

        showMessage("Thanh cong", "Dang nhap thanh cong!");
        const accessToken = await getAccessToken();
        console.log(accessToken);
        router.replace("/(main)/home");
      }
    } catch (error: any) {
      showMessage("Dang nhap that bai", error.toString());
    } finally {
      setIsLoading(false);
    }
  };

  const isValidEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <View style={styles.logoRow}>
          <Text style={styles.logoTextMain}>Go</Text>
          <Text style={styles.logoTextSecondary}>Go</Text>
        </View>
      </View>

      <Text style={styles.title}>Dang nhap</Text>

      <Input
        label="Email"
        placeholder="Nhap email cua ban"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <Input
        label="Mat khau"
        placeholder="Nhap mat khau"
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
          <Text style={styles.rememberText}>Nho mat khau</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/(auth)/forgot-password")}
        >
          <Text style={styles.forgotText}>Quen mat khau?</Text>
        </TouchableOpacity>
      </View>

      <Button
        title={isLoading ? "Dang nhap..." : "Dang nhap"}
        onPress={handleLogin}
        style={{ backgroundColor: COLORS.amberGold }}
      />
      <Button
        title="Chua co tai khoan? Dang ky ngay"
        variant="outline"
        onPress={() => router.push("/(auth)/register")}
        style={{ borderColor: COLORS.amberGold }}
      />
    </View>
  );
};
