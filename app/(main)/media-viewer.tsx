import { Stack } from "expo-router";
import { MediaViewerScreen } from "../../src/features/chat/screens/MediaViewerScreen";

export default function MediaViewer() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false, presentation: "transparentModal", animation: "fade" }} />
      <MediaViewerScreen />
    </>
  );
}