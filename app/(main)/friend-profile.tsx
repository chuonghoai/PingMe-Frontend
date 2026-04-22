import { Stack } from "expo-router";
import { FriendProfileScreen } from "../../src/features/main/screens/FriendProfileScreen";

export default function FriendProfile() {
    return (
        <>
            <Stack.Screen options={{ headerShown: false }} />
            <FriendProfileScreen />
        </>
    );
}
