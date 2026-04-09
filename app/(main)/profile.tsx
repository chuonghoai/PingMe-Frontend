import { Stack } from "expo-router";
import { ProfileScreen } from "@/features/profile/screens/ProfileScreen";

export default function Profile() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Hồ sơ của tôi",
          headerBackTitle: "Trang chủ",
        }}
      />
      <ProfileScreen />
    </>
  );
}
