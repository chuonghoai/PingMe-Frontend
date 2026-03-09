import { Stack } from "expo-router";
import { ChatListScreen } from "../../../src/features/chat/screens/ChatListScreen";

export default function ChatList() {
  return (
    <>
      {/* Đổi màu header cho hợp với Dark Mode của danh sách */}
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
