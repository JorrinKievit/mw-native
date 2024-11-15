import { Keyboard } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

import { usePlayer } from "~/hooks/player/usePlayer";
import { usePlayerStore } from "~/stores/player/store";

export const BackButton = () => {
  const resetVideo = usePlayerStore((state) => state.resetVideo);
  const { dismissFullscreenPlayer } = usePlayer();
  const router = useRouter();

  return (
    <Ionicons
      name="arrow-back"
      onPress={() => {
        resetVideo();
        dismissFullscreenPlayer()
          .then(() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
            return setTimeout(() => {
              Keyboard.dismiss();
            }, 100);
          })
          .catch(() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/");
            }
            return setTimeout(() => {
              Keyboard.dismiss();
            }, 100);
          });
      }}
      size={36}
      color="white"
      style={{
        width: 100,
      }}
    />
  );
};
