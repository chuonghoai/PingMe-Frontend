import { Stack } from "expo-router";
import { ChatMediaScreen } from "../../src/features/chat/screens/ChatMediaScreen";

export default function ChatMedia() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatMediaScreen />
    </>
  );
}