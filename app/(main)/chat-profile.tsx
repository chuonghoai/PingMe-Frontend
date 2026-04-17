import { Stack } from "expo-router";
import { ChatProfileScreen } from "../../src/features/chat/screens/ChatProfileScreen";

export default function ChatProfile() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <ChatProfileScreen />
        </>
    );
}