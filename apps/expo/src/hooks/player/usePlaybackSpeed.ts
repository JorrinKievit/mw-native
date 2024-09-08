import { useCallback } from "react";

import { usePlayerStore } from "~/stores/player/store";

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

export const usePlaybackSpeed = () => {
  const player = usePlayerStore((state) => state.player);

  const changePlaybackSpeed = useCallback(
    (newValue: number) => {
      if (player) {
        player.playbackRate = newValue;
      }
    },
    [player],
  );

  return {
    speeds,
    currentSpeed: player?.playbackRate ?? 1,
    changePlaybackSpeed,
  } as const;
};
