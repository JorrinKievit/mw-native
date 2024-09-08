import { MaterialIcons } from "@expo/vector-icons";

import { usePlayerStore } from "~/stores/player/store";

interface SeekProps {
  type: "forward" | "backward";
}

export const SeekButton = ({ type }: SeekProps) => {
  const player = usePlayerStore((state) => state.player);
  const setAudioPositionAsync = usePlayerStore(
    (state) => state.setAudioPositionAsync,
  );

  if (!player) return null;

  return (
    <MaterialIcons
      name={type === "forward" ? "forward-10" : "replay-10"}
      size={36}
      color="white"
      onPress={() => {
        player.currentTime =
          type === "forward"
            ? player.currentTime + 10
            : player.currentTime - 10;
        void setAudioPositionAsync(player.currentTime);
      }}
    />
  );
};
