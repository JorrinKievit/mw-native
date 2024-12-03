import { useEvent } from "expo";
import { FontAwesome } from "@expo/vector-icons";
import { Spinner } from "tamagui";

import { usePlayerStore } from "~/stores/player/store";

export const PlayButton = () => {
  const player = usePlayerStore((state) => state.player);
  const audioPlayer = usePlayerStore((state) => state.audioPlayer);

  const { isPlaying } = useEvent(player!, "playingChange", {
    isPlaying: player!.playing,
  });
  const { status } = useEvent(player!, "statusChange", {
    status: player!.status,
  });

  if (!player) return null;

  if (status === "loading") {
    return <Spinner size="large" color="white" />;
  }

  return (
    <FontAwesome
      name={isPlaying ? "pause" : "play"}
      size={36}
      color="white"
      onPress={() => {
        console.log("video player playing", player.playing);
        console.log("audio player playing", audioPlayer?.playing);
        player.playing ? player.pause() : player.play();
        audioPlayer?.playing ? audioPlayer?.pause() : audioPlayer?.play();
      }}
    />
  );
};
