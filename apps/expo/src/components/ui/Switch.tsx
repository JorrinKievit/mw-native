import { styled, Switch, withStaticProperties } from "tamagui";

const MWSwitchFrame = styled(Switch, {
  variants: {
    type: {
      default: {
        native: true,
        nativeProps: {
          trackColor: {
            true: "$purple300",
            false: "$ash500",
          },
          thumbColor: "white",
        },
      },
    },
  },
  defaultVariants: {
    type: "default",
  },
});

const MWSwitch = withStaticProperties(MWSwitchFrame, {
  Thumb: styled(Switch.Thumb, {
    animation: "bounce",
  }),
});

export { MWSwitch };
