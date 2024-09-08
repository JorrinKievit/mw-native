import { useCallback } from "react";
import { TouchableOpacity } from "react-native";

import { usePlayerStore } from "~/stores/player/store";
import VideoSlider from "./VideoSlider";

export const ProgressBar = () => {
  const player = usePlayerStore((state) => state.player);
  const setIsIdle = usePlayerStore((state) => state.setIsIdle);

  const updateProgress = useCallback(
    (newProgress: number) => {
      if (!player) return;
      player.currentTime = newProgress;
    },
    [player],
  );

  if (!player) return null;

  return (
    <TouchableOpacity
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingBottom: 36,
        paddingTop: 24,
      }}
      onPress={() => setIsIdle(false)}
      disabled={player.status !== "readyToPlay"}
    >
      <VideoSlider onSlidingComplete={updateProgress} />
    </TouchableOpacity>
  );
};
