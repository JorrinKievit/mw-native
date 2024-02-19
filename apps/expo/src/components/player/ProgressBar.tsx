import { useCallback } from "react";
import { TouchableOpacity } from "react-native";

import { usePlayerStore } from "~/stores/player/store";
import VideoSlider from "./VideoSlider";

export const ProgressBar = () => {
  const status = usePlayerStore((state) => state.status);
  const videoRef = usePlayerStore((state) => state.videoRef);
  const setIsIdle = usePlayerStore((state) => state.setIsIdle);

  const updateProgress = useCallback(
    (newProgress: number) => {
      videoRef?.setStatusAsync({ positionMillis: newProgress }).catch(() => {
        console.error("Error updating progress");
      });
    },
    [videoRef],
  );

  if (status?.isLoaded) {
    return (
      <TouchableOpacity
        className="flex flex-1 items-center justify-center pb-8 pt-6"
        onPress={() => setIsIdle(false)}
      >
        <VideoSlider onSlidingComplete={updateProgress} />
      </TouchableOpacity>
    );
  }
};
