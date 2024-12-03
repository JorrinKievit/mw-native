import type { SharedValue } from "react-native-reanimated";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Dimensions, Platform } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { createAudioPlayer } from "expo-audio";
import { useKeepAwake } from "expo-keep-awake";
import * as NavigationBar from "expo-navigation-bar";
import * as Network from "expo-network";
import { useRouter } from "expo-router";
import * as StatusBar from "expo-status-bar";
import { createVideoPlayer, VideoView } from "expo-video";
import { Feather } from "@expo/vector-icons";
import { Spinner, useTheme, View } from "tamagui";

import {
  extractTracksFromHLS,
  filterAudioTracks,
  findHLSQuality,
  findQuality,
} from "@movie-web/provider-utils";

import { useBrightness } from "~/hooks/player/useBrightness";
import { usePlayer } from "~/hooks/player/usePlayer";
import { useVolume } from "~/hooks/player/useVolume";
import {
  convertMetaToItemData,
  convertMetaToScrapeMedia,
  getNextEpisode,
} from "~/lib/meta";
import { useAudioTrackStore } from "~/stores/audio";
import { usePlayerStore } from "~/stores/player/store";
import {
  DefaultQuality,
  useNetworkSettingsStore,
  usePlayerSettingsStore,
  useWatchHistoryStore,
} from "~/stores/settings";
import { CaptionRenderer } from "./CaptionRenderer";
import { ControlsOverlay } from "./ControlsOverlay";

export const VideoPlayer = () => {
  useKeepAwake();

  const {
    brightness,
    showBrightnessOverlay,
    setShowBrightnessOverlay,
    handleBrightnessChange,
  } = useBrightness();
  const { volume, showVolumeOverlay, setShowVolumeOverlay } = useVolume();

  const { dismissFullscreenPlayer } = usePlayer();
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const isIdle = usePlayerStore((state) => state.interface.isIdle);
  const stream = usePlayerStore((state) => state.interface.currentStream);
  const selectedAudioTrack = useAudioTrackStore((state) => state.selectedTrack);
  const videoSrc = usePlayerStore((state) => state.videoSrc);
  const setVideoSrc = usePlayerStore((state) => state.setVideoSrc);
  const setVideoPlayer = usePlayerStore((state) => state.setVideoPlayer);
  const setAudioPlayer = usePlayerStore((state) => state.setAudioPlayer);
  const setIsIdle = usePlayerStore((state) => state.setIsIdle);
  const toggleState = usePlayerStore((state) => state.toggleState);
  const setHlsTracks = usePlayerStore((state) => state.setHlsTracks);
  const setAudioTracks = usePlayerStore((state) => state.setAudioTracks);
  const meta = usePlayerStore((state) => state.meta);
  const setMeta = usePlayerStore((state) => state.setMeta);
  const isLocalFile = usePlayerStore((state) => state.isLocalFile);

  const { gestureControls, autoPlay } = usePlayerSettingsStore();
  const { updateWatchHistory, removeFromWatchHistory, getWatchHistoryItem } =
    useWatchHistoryStore();
  const { wifiDefaultQuality, mobileDataDefaultQuality } =
    useNetworkSettingsStore();

  const player = useMemo(() => createVideoPlayer(videoSrc ?? null), [videoSrc]);
  // const audioPlayer = useMemo(
  //   () => createAudioPlayer(selectedAudioTrack?.uri ?? ""),
  //   [selectedAudioTrack],
  // );
  const audioPlayer = usePlayerStore((state) => state.audioPlayer);

  useEffect(() => {
    if (player) {
      player.audioMixingMode = "mixWithOthers";
      player.timeUpdateEventInterval = 1;
      setVideoPlayer(player);
    }

    // if (audioPlayer) {
    //   setAudioPlayer(audioPlayer);
    // }

    return () => {
      console.log("releasing players");
      // player?.release();
      // audioPlayer?.release();
    };
  }, [audioPlayer, player, setAudioPlayer, setVideoPlayer]);

  useEffect(() => {
    if (meta && player?.status === "readyToPlay" && player.currentTime < 1) {
      const media = convertMetaToScrapeMedia(meta);
      const watchHistoryItem = getWatchHistoryItem(media);
      if (watchHistoryItem) {
        player.currentTime = watchHistoryItem.positionMillis / 1000;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player?.status]);

  const toggleAudio = useCallback(() => {
    if (audioPlayer) {
      audioPlayer.playing ? audioPlayer.pause() : audioPlayer.play();
    }
  }, [audioPlayer]);

  const doubleTapGesture = Gesture.Tap()
    .enabled(gestureControls && isIdle)
    .numberOfTaps(2)
    .onEnd(() => {
      runOnJS(toggleAudio)();
      runOnJS(toggleState)();
    });

  const screenHalfWidth = Dimensions.get("window").width / 2;

  const panGesture = Gesture.Pan()
    .enabled(gestureControls && isIdle)
    .onStart((event) => {
      if (event.x > screenHalfWidth) {
        runOnJS(setShowVolumeOverlay)(true);
      } else {
        runOnJS(setShowBrightnessOverlay)(true);
      }
    })
    .onUpdate((event) => {
      const divisor = 5000;
      const directionMultiplier = event.velocityY < 0 ? 1 : -1;

      const change = directionMultiplier * Math.abs(event.velocityY / divisor);

      if (event.x > screenHalfWidth) {
        const newVolume = Math.max(0, Math.min(1, volume.value + change));
        volume.value = newVolume;
      } else {
        const newBrightness = Math.max(
          0,
          Math.min(1, brightness.value + change),
        );
        brightness.value = newBrightness;
        runOnJS(handleBrightnessChange)(newBrightness);
      }
    })
    .onEnd((event) => {
      if (event.x > screenHalfWidth) {
        runOnJS(setShowVolumeOverlay)(false);
      } else {
        runOnJS(setShowBrightnessOverlay)(false);
      }
    });

  const composedGesture = Gesture.Race(panGesture, doubleTapGesture);

  StatusBar.setStatusBarHidden(true);

  if (Platform.OS === "android") {
    void NavigationBar.setVisibilityAsync("hidden");
  }

  // TODO: Rerender with player.currentTime on this function call throws an error in expo-video
  useEffect(() => {
    const initializePlayer = async () => {
      if (isLocalFile) return;

      if (!stream) {
        await dismissFullscreenPlayer();
        return router.back();
      }
      setIsLoading(true);

      const { type: networkType } = await Network.getNetworkStateAsync();
      const defaultQuality =
        networkType === Network.NetworkStateType.WIFI
          ? wifiDefaultQuality
          : mobileDataDefaultQuality;
      const highest = defaultQuality === DefaultQuality.Highest;

      let url = null;

      if (stream.type === "hls") {
        url = await findHLSQuality(stream.playlist, stream.headers, highest);
        const tracks = await extractTracksFromHLS(stream.playlist, {
          ...stream.preferredHeaders,
          ...stream.headers,
        });

        if (tracks) setHlsTracks(tracks);

        if (tracks?.audio.length) {
          setAudioTracks(filterAudioTracks(tracks, stream.playlist));
        }
      }

      if (stream.type === "file") {
        const chosenQuality = findQuality(stream, highest);
        url = chosenQuality ? stream.qualities[chosenQuality]?.url : null;
      }

      if (!url) {
        await dismissFullscreenPlayer();
        return router.back();
      }

      setVideoSrc({
        uri: url,
        headers: {
          ...stream.preferredHeaders,
          ...stream.headers,
        },
      });

      setIsLoading(false);
    };

    void initializePlayer();

    return () => {
      if (meta) {
        const item = convertMetaToItemData(meta);
        const scrapeMedia = convertMetaToScrapeMedia(meta);
        updateWatchHistory(item, scrapeMedia, player?.currentTime ?? 0);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    isLocalFile,
    dismissFullscreenPlayer,
    meta,
    router,
    selectedAudioTrack,
    setVideoSrc,
    stream,
    updateWatchHistory,
    wifiDefaultQuality,
    mobileDataDefaultQuality,
  ]);

  useEffect(() => {
    const playerStatusChange = player?.addListener("statusChange", (data) => {
      const isFinished = player.duration - player.currentTime < 1;
      if (
        meta &&
        data.status === "idle" &&
        meta.type === "movie" &&
        isFinished
      ) {
        const item = convertMetaToItemData(meta);
        removeFromWatchHistory(item);
      }

      if (autoPlay && data.status === "idle" && meta?.type === "show") {
        getNextEpisode(meta)
          .then((nextEpisodeMeta) => {
            if (!nextEpisodeMeta) return;
            setMeta(nextEpisodeMeta);
            const media = convertMetaToScrapeMedia(nextEpisodeMeta);

            router.replace({
              pathname: "/videoPlayer",
              params: { media: JSON.stringify(media) },
            });
          })
          .catch(console.error);
      }
    });

    return () => {
      playerStatusChange?.remove();
    };
  }, [player, meta, removeFromWatchHistory, autoPlay, setMeta, router]);

  console.log("videoPlayer", player.playing);
  console.log("audioPlayer", audioPlayer?.playing);

  return (
    <GestureDetector gesture={composedGesture}>
      <View
        flex={1}
        flexDirection="row"
        alignItems="center"
        justifyContent="center"
        backgroundColor="black"
      >
        <VideoView
          player={player}
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              ...(!isIdle && {
                opacity: 0.7,
              }),
            },
          ]}
          nativeControls={false}
          onTouchStart={() => setIsIdle(!isIdle)}
        />
        <View
          height="100%"
          width="100%"
          alignItems="center"
          justifyContent="center"
        >
          {isLoading ? (
            <Spinner size="large" color="white" position="absolute" />
          ) : null}

          <ControlsOverlay isLoading={isLoading} />
        </View>
        {showVolumeOverlay && <GestureOverlay value={volume} type="volume" />}
        {showBrightnessOverlay && (
          <GestureOverlay value={brightness} type="brightness" />
        )}
        <CaptionRenderer />
      </View>
    </GestureDetector>
  );
};

function GestureOverlay(props: {
  value: SharedValue<number>;
  type: "brightness" | "volume";
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: `${props.value.value * 100}%`,
      borderTopLeftRadius: props.value.value >= 0.98 ? 44 : 0,
      borderTopRightRadius: props.value.value >= 0.98 ? 44 : 0,
    };
  });

  return (
    <View
      position="absolute"
      left={props.type === "volume" ? insets.left + 20 : undefined}
      right={props.type === "brightness" ? insets.right + 20 : undefined}
      borderRadius="$4"
      gap={8}
      height="50%"
    >
      <Feather
        size={24}
        color="white"
        style={{
          bottom: 20,
        }}
        name={props.type === "brightness" ? "sun" : "volume-2"}
      />
      <View
        width={14}
        backgroundColor={theme.progressBackground}
        justifyContent="flex-end"
        borderRadius="$4"
        left={4}
        bottom={20}
        height="100%"
      >
        <Animated.View
          style={[
            animatedStyle,
            {
              width: "100%",
              backgroundColor: theme.progressFilled.val,
              borderBottomRightRadius: 44,
              borderBottomLeftRadius: 44,
            },
          ]}
        />
      </View>
    </View>
  );
}
