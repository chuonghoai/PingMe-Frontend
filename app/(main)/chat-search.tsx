import { Stack } from "expo-router";
import { ChatSearchScreen } from "../../src/features/chat/screens/ChatSearchScreen";

export default function ChatSearch() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChatSearchScreen />
    </>
  );
}
