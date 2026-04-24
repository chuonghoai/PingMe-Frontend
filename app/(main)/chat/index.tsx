import { Stack } from "expo-router";
import { ChatListScreen } from "@/features/chat/screens/ChatListScreen";

export default function ChatList() {
  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: "Tin nhắn",
          headerStyle: { backgroundColor: "#1E1E1E" },
          headerTintColor: "#fff",
        }}
      />
      <ChatListScreen />
    </>
  );
}
