import { useCallback, useState } from "react";
import { Keyboard, TouchableOpacity } from "react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Image, Text, View } from "tamagui";

import type { Action } from "./ContextMenu";
import { useToast } from "~/hooks/useToast";
import { usePlayerStore } from "~/stores/player/store";
import { useBookmarkStore, useWatchHistoryStore } from "~/stores/settings";
import { ContextMenuActions, SheetContextMenu } from "./ContextMenu";

export interface ItemData {
  id: string;
  title: string;
  type: "movie" | "tv";
  season?: number;
  episode?: number;
  year: number;
  release_date?: Date;
  posterUrl: string;
}

function checkReleased(media: ItemData): boolean {
  const isReleasedYear = Boolean(
    media.year && media.year <= new Date().getFullYear(),
  );
  const isReleasedDate = Boolean(
    media.release_date && media.release_date <= new Date(),
  );

  // If the media has a release date, use that, otherwise use the year
  const isReleased = media.release_date ? isReleasedDate : isReleasedYear;

  return isReleased;
}

export default function Item({ data }: { data: ItemData }) {
  const resetVideo = usePlayerStore((state) => state.resetVideo);
  const router = useRouter();
  const { isBookmarked, addBookmark, removeBookmark } = useBookmarkStore();
  const { hasWatchHistoryItem, removeFromWatchHistory } =
    useWatchHistoryStore();
  const { showToast } = useToast();

  const { title, type, year, posterUrl } = data;

  const isReleased = useCallback(() => checkReleased(data), [data]);

  const handlePress = () => {
    if (!isReleased()) {
      showToast("This media is not released yet", {
        burntOptions: { preset: "error" },
      });
      return;
    }
    resetVideo();
    Keyboard.dismiss();
    router.push({
      pathname: "/videoPlayer",
      params: { data: JSON.stringify(data) },
    });
  };

  const [menuOpen, setMenuOpen] = useState(false);

  const handleLongPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setMenuOpen(true);
  };

  const contextMenuActions: Action[] = [
    {
      title: isBookmarked(data)
        ? ContextMenuActions.RemoveBookmark
        : ContextMenuActions.Bookmark,
      onPress: () => {
        if (isBookmarked(data)) {
          removeBookmark(data);
          showToast("Removed from bookmarks", {
            burntOptions: { preset: "done" },
          });
        } else {
          addBookmark(data);
          showToast("Added to bookmarks", { burntOptions: { preset: "done" } });
        }
      },
    },
    ...(data.type === "movie"
      ? [
          {
            title: ContextMenuActions.Download,
            onPress: () => {
              router.push({
                pathname: "/videoPlayer",
                params: { data: JSON.stringify(data), download: "true" },
              });
            },
          },
        ]
      : []),
    ...(hasWatchHistoryItem(data)
      ? [
          {
            title: ContextMenuActions.RemoveWatchHistoryItem,
            onPress: () => {
              removeFromWatchHistory(data);
              showToast("Removed from Continue Watching", {
                burntOptions: { preset: "done" },
              });
            },
          },
        ]
      : []),
  ];

  return (
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={{ width: "100%" }}
    >
      <View width="100%" justifyContent="center" alignItems="center">
        <View
          marginBottom={4}
          aspectRatio={9 / 14}
          width="100%"
          overflow="hidden"
          borderRadius={24}
          height="$14"
        >
          <Image source={{ uri: posterUrl }} width="100%" height="100%" />
        </View>
        <Text fontWeight="bold" fontSize={14} numberOfLines={1}>
          {title}
        </Text>
        <View flexDirection="row" alignItems="center" gap="$2">
          <Text fontSize={12} color="$ash100">
            {type === "tv" ? "Show" : "Movie"}
          </Text>
          <View
            height={6}
            width={6}
            borderRadius={24}
            backgroundColor="$ash100"
          />
          <Text fontSize={12} color="$ash100">
            {isReleased() ? year : "Unreleased"}
          </Text>
        </View>
      </View>
      <SheetContextMenu
        isOpen={menuOpen}
        actions={contextMenuActions}
        onClose={() => setMenuOpen(false)}
      />
    </TouchableOpacity>
  );
}
