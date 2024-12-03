import type { AudioPlayer } from "expo-audio";

import type { MakeSlice } from "./types";

export interface AudioSlice {
  audioPlayer: AudioPlayer | null;

  setAudioPlayer(audioPlayer: AudioPlayer | null): void;
}

export const createAudioSlice: MakeSlice<AudioSlice> = (set) => ({
  audioPlayer: null,

  setAudioPlayer: (audioPlayer) => {
    set({ audioPlayer });
  },
});
