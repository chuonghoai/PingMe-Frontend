import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Switch, Text, View } from "react-native";
import { Button } from "@/components/Button/Button";

import { COLORS, styles } from "./LocationPermissionScreen.styles";

export const LocationPermissionScreen = () => {
  const router = useRouter();
  const [isAllowed, setIsAllowed] = useState(false);

  const handleFinish = () => {
    router.replace("/(onboarding)/welcome" as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>📍</Text>
        <Text style={styles.title}>Cấp quyền vị trí</Text>
        <Text style={styles.description}>
          App cần quyền truy cập vị trí của bạn để có thể hiển thị bạn bè và
          những người xung quanh trên bản đồ một cách chính xác nhất.
        </Text>

        <View style={styles.sliderContainer}>
          <Text style={styles.sliderText}>
            {isAllowed ? "Đã cho phép" : "Kéo để cho phép"}
          </Text>
          <Switch
            value={isAllowed}
            onValueChange={setIsAllowed}
            trackColor={{ false: "#767577", true: COLORS.amberGold }}
            thumbColor={"#f4f3f4"}
            style={{ transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }] }}
          />
        </View>

        <Button
          title="Hoàn tất & Bắt đầu"
          disabled={!isAllowed}
          style={{
            opacity: isAllowed ? 1 : 0.5,
            marginTop: 20,
            backgroundColor: COLORS.amberGold,
          }}
          onPress={handleFinish}
        />
      </View>
    </View>
  );
};
