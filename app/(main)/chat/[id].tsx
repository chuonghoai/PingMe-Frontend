import { Stack, useLocalSearchParams } from "expo-router";
import { ChatRoomScreen } from "../../../src/features/chat/screens/ChatRoomScreen";

export default function ChatRoom() {
  const { name } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: (name as string) || "Trò chuyện", // Hiển thị tên người chat lên Header
          headerBackTitle: "Quay lại",
        }}
      />
      <ChatRoomScreen />
    </>
  );
}
