import type { VideoPlayer, VideoSource } from "expo-video";

import type { MakeSlice } from "./types";
import { PlayerStatus } from "./interface";

export interface PlayerMetaEpisode {
  number: number;
  tmdbId: string;
  title?: string;
}

export interface PlayerMeta {
  type: "movie" | "show";
  title: string;
  tmdbId: string;
  imdbId?: string;
  releaseYear: number;
  poster?: string;
  episodes?: PlayerMetaEpisode[];
  episode?: PlayerMetaEpisode;
  season?: {
    number: number;
    tmdbId: string;
    title?: string;
  };
}

export interface VideoSlice {
  player: VideoPlayer | null;
  videoSrc: Exclude<VideoSource, string> | null;
  meta: PlayerMeta | null;
  isLocalFile: boolean;

  setVideoPlayer(player: VideoPlayer | null): void;
  setVideoSrc(src: Exclude<VideoSource, string> | null): void;
  setMeta(meta: PlayerMeta | null): void;
  setIsLocalFile(isLocalFile: boolean): void;
  resetVideo(): void;
}

export const createVideoSlice: MakeSlice<VideoSlice> = (set) => ({
  player: null,
  videoSrc: null,
  status: null,
  meta: null,
  isLocalFile: false,

  setVideoPlayer: (player) => {
    set({ player });
  },
  setVideoSrc: (src) => {
    set((s) => {
      s.videoSrc = src;
    });
  },
  setMeta: (meta) => {
    set((s) => {
      s.interface.playerStatus = PlayerStatus.SCRAPING;
      s.meta = meta;
    });
  },
  setIsLocalFile: (isLocalFile) => {
    set({ isLocalFile });
  },
  resetVideo() {
    set((s) => {
      s.player?.release();
      return {
        meta: null,
        isLocalFile: false,
        videoSrc: null,
        player: null,
        interface: {
          playerStatus: PlayerStatus.SCRAPING,
        },
      };
    });
  },
});
