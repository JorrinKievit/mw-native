import { useCallback, useEffect } from "react";
import { Audio } from "expo-av";

import type { Stream } from "@movie-web/provider-utils";

import type { AudioTrack } from "~/components/player/AudioTrackSelector";
import { usePlayerStore } from "~/stores/player/store";

export const useAudioTrack = () => {
  const player = usePlayerStore((state) => state.player);
  const audioObject = usePlayerStore((state) => state.audioObject);
  const currentAudioTrack = usePlayerStore((state) => state.currentAudioTrack);
  const setAudioObject = usePlayerStore((state) => state.setAudioObject);
  const setCurrentAudioTrack = usePlayerStore(
    (state) => state.setCurrentAudioTrack,
  );

  const synchronizePlayback = useCallback(
    async (selectedAudioTrack?: AudioTrack, stream?: Stream) => {
      if (selectedAudioTrack && stream) {
        if (audioObject) {
          await audioObject.unloadAsync();
        }

        const createAudioAsyncWithTimeout = (uri: string, timeout = 5000) => {
          return new Promise<Audio.Sound | undefined>((resolve, reject) => {
            Audio.Sound.createAsync({
              uri,
              headers: {
                ...stream.headers,
                ...stream.preferredHeaders,
              },
            })
              .then((value) => resolve(value.sound))
              .catch(reject);

            setTimeout(() => {
              reject(new Error("Timeout: Audio loading took too long"));
            }, timeout);
          });
        };
        try {
          const sound = await createAudioAsyncWithTimeout(
            selectedAudioTrack.uri,
          );
          if (!sound) return;
          setAudioObject(sound);
          setCurrentAudioTrack(selectedAudioTrack);
        } catch (error) {
          console.error("Error loading audio track:", error);
        }
      } else {
        if (audioObject) {
          await audioObject.unloadAsync();
          setAudioObject(null);
        }
      }
    },
    [audioObject, setAudioObject, setCurrentAudioTrack],
  );

  const synchronizeAudioWithVideo = useCallback(
    async (
      audioObject: Audio.Sound | null,
      selectedAudioTrack?: AudioTrack,
    ) => {
      if (player && audioObject) {
        if (selectedAudioTrack) {
          player.volume = 0;
          await audioObject.playAsync();
          await audioObject.setPositionAsync(player.currentTime * 1000);
        } else {
          player.volume = 1;
          await audioObject.pauseAsync();
        }
      }
    },
    [player],
  );

  useEffect(() => {
    if (audioObject && currentAudioTrack) {
      void synchronizeAudioWithVideo(audioObject, currentAudioTrack);
    }
  }, [audioObject, currentAudioTrack, synchronizeAudioWithVideo]);

  return { synchronizePlayback };
};
