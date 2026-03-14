import { ChatProvider } from "@/src/features/chat/store/ChatContext";
import { Stack } from "expo-router";
import { UserProvider } from "../src/store/UserContext";

export default function RootLayout() {
  return (
    <UserProvider>
      <ChatProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(onboarding)" />
          <Stack.Screen name="(main)" />
        </Stack>
      </ChatProvider>
    </UserProvider>
  );
}
