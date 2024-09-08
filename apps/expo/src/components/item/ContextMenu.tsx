import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Sheet, useTheme } from "tamagui";

import { Settings } from "../player/settings/Sheet";

export enum ContextMenuActions {
  Bookmark = "Bookmark",
  RemoveBookmark = "Remove Bookmark",
  Download = "Download",
  RemoveWatchHistoryItem = "Remove from Continue Watching",
  Cancel = "Cancel",
  Remove = "Remove",
}

export interface Action {
  title: ContextMenuActions;
  onPress: () => void;
}

interface SheetContextMenuProps {
  isOpen: boolean;
  actions: Action[];
  onClose: () => void;
}

export const SheetContextMenu: React.FC<SheetContextMenuProps> = ({
  isOpen,
  actions,
  onClose,
}) => {
  const theme = useTheme();

  type IconName =
    | "bookmark-outline"
    | "bookmark-off-outline"
    | "download-outline"
    | "clock-remove-outline";

  const iconMap: Record<string, IconName> = {
    [ContextMenuActions.Bookmark]: "bookmark-outline",
    [ContextMenuActions.RemoveBookmark]: "bookmark-off-outline",
    [ContextMenuActions.Download]: "download-outline",
    [ContextMenuActions.RemoveWatchHistoryItem]: "clock-remove-outline",
  };

  return (
    <Sheet
      modal
      open={isOpen}
      onOpenChange={onClose}
      snapPoints={[35]}
      dismissOnSnapToBottom
      dismissOnOverlayPress
      animationConfig={{
        type: "spring",
        damping: 20,
        mass: 1.2,
        stiffness: 250,
      }}
    >
      <Sheet.Handle backgroundColor="$sheetHandle" />
      <Sheet.Frame
        backgroundColor="$sheetBackground"
        padding="$4"
        alignItems="center"
        justifyContent="center"
      >
        <Settings.Content>
          {actions.map((action, index) => (
            <Settings.Item
              key={index}
              title={action.title}
              iconRight={
                <MaterialCommunityIcons
                  name={iconMap[action.title]}
                  size={24}
                  color={theme.sheetItemSelected.val}
                />
              }
              onPress={() => {
                action.onPress();
                onClose();
              }}
            />
          ))}
        </Settings.Content>
      </Sheet.Frame>
      <Sheet.Overlay
        animation="lazy"
        backgroundColor="rgba(0, 0, 0, 0.8)"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
      />
    </Sheet>
  );
};
