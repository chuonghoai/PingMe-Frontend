import { ChatProvider } from "@/features/chat/store/ChatContext";
import { Stack } from "expo-router";
import { UserProvider } from "@/store/UserContext";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { BackgroundNotificationHandler } from "@/features/main/services/BackgroundNotificationHandler";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <BackgroundNotificationHandler />
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0A0A0A' }}>
        <UserProvider>
          <ChatProvider>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(onboarding)" />
              <Stack.Screen name="(main)" />
            </Stack>
          </ChatProvider>
        </UserProvider>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
