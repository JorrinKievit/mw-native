import { Pressable, ScrollView, View } from "react-native";
import Modal from "react-native-modal";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import colors from "@movie-web/tailwind-config/colors";

import { useBoolean } from "~/hooks/useBoolean";
import { useAudioTrackStore } from "~/stores/audio";
import { usePlayerStore } from "~/stores/player/store";
import { Button } from "../ui/Button";
import { Text } from "../ui/Text";
import { Controls } from "./Controls";

export const AudioTrackSelector = () => {
  const tracks = usePlayerStore((state) => state.interface.audioTracks);

  const setSelectedAudioTrack = useAudioTrackStore(
    (state) => state.setSelectedAudioTrack,
  );

  const { isTrue, on, off } = useBoolean();

  if (!tracks?.length) return null;

  return (
    <View className="max-w-36 flex-1">
      <Controls>
        <Button
          title="Audio"
          variant="outline"
          onPress={on}
          iconLeft={
            <MaterialCommunityIcons
              name="volume-high"
              size={24}
              color={colors.primary[300]}
            />
          }
        />
      </Controls>

      <Modal
        isVisible={isTrue}
        onBackdropPress={off}
        supportedOrientations={["portrait", "landscape"]}
        style={{
          width: "35%",
          justifyContent: "center",
          alignSelf: "center",
        }}
      >
        <ScrollView className="flex-1 bg-gray-900">
          <Text className="text-center font-bold">Select audio</Text>
          {tracks?.map((track) => (
            <Pressable
              className="flex w-full flex-row justify-between p-3"
              key={track.language}
              onPress={() => {
                setSelectedAudioTrack(track);
                off();
              }}
            >
              <Text>{track.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Modal>
    </View>
  );
};