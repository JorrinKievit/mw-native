import { useEffect, useState } from "react";
import { FontAwesome } from "@expo/vector-icons";
import { Spinner } from "tamagui";

import { usePlayerStore } from "~/stores/player/store";

export const PlayButton = () => {
  const player = usePlayerStore((state) => state.player);
  const playAudio = usePlayerStore((state) => state.playAudio);
  const pauseAudio = usePlayerStore((state) => state.pauseAudio);

  const [isPlaying, setIsPlaying] = useState(player?.playing ?? false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const statusListener = player?.addListener("statusChange", (status) => {
      setIsLoading(status === "loading");
    });

    return () => {
      statusListener?.remove();
    };
  }, [player]);

  if (!player) return null;

  if (isLoading) {
    return <Spinner size="large" color="white" />;
  }

  return (
    <FontAwesome
      name={isPlaying ? "pause" : "play"}
      size={36}
      color="white"
      onPress={() => {
        if (player.playing) {
          player.pause();
          void pauseAudio();
          setIsPlaying(false);
        } else {
          player.play();
          void playAudio();
          setIsPlaying(true);
        }
      }}
    />
  );
};
