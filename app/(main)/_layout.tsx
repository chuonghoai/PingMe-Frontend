import { Stack } from "expo-router";

export default function MainLayout() {
  return (
    <Stack>
      <Stack.Screen name="home" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />

      <Stack.Screen
        name="chat/index"
        options={{
          headerShown: false,
          presentation: "transparentModal",
          animation: "slide_from_bottom",
        }}
      />

      {/* Cấu hình thêm cho màn hình Chat Room (ẩn header mặc định) */}
      <Stack.Screen
        name="chat/[id]"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="call"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="chat-profile"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="chat-media"
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="media-viewer"
        options={{
          headerShown: false,
          presentation: "transparentModal",
          animation: "fade",
        }}
      />
    </Stack>
  );
}
