import { Stack, useLocalSearchParams } from "expo-router";
import { ChatRoomScreen } from "../../../src/features/chat/screens/ChatRoomScreen";

export default function ChatRoom() {
  const { name } = useLocalSearchParams();

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: (name as string) || "Trò chuyện",
          headerBackTitle: "Quay lại",
        }}
      />
      <ChatRoomScreen />
    </>
  );
}
