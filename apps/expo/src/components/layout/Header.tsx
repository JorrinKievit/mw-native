import { View } from "tamagui";

import { BrandPill } from "../BrandPill";

export function Header() {
  return (
    <View alignItems="center" gap="$3" flexDirection="row">
      <BrandPill />

      {/* <Circle
        backgroundColor="$pillBackground"
        size="$3.5"
        pressStyle={{
          opacity: 1,
          scale: 1.05,
        }}
        onPress={async () => {
          await Linking.openURL(DISCORD_LINK);
        }}
        onLongPress={() =>
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        }
      >
        <MaterialIcons name="discord" size={28} color="white" />
      </Circle>
      <Circle
        backgroundColor="$pillBackground"
        size="$3.5"
        pressStyle={{
          opacity: 1,
          scale: 1.05,
        }}
        onPress={async () => {
          await Linking.openURL(GITHUB_LINK);
        }}
        onLongPress={() =>
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
        }
      >
        <FontAwesome6 name="github" size={28} color="white" />
      </Circle> */}
    </View>
  );
}
