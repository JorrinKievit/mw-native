import type { ExpoConfig } from "expo/config";

import { version } from "./package.json";

const defineConfig = (): ExpoConfig => ({
  name: "movie-web",
  slug: "mw-mobile",
  scheme: "movieweb",
  version,
  icon: "./assets/images/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "dev.movieweb.mobile",
    supportsTablet: true,
    requireFullScreen: true,
    infoPlist: {
      CFBundleName: "movie-web",
      NSPhotoLibraryUsageDescription:
        "This app saves videos to the photo library.",
    },
  },
  android: {
    package: "dev.movieweb.mobile",
    permissions: ["WRITE_SETTINGS"],
  },
  web: {
    favicon: "./assets/images/favicon.png",
    bundler: "metro",
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: [
    "expo-router",
    "expo-video",
    [
      "expo-screen-orientation",
      {
        initialOrientation: "PORTRAIT_UP",
      },
    ],
    [
      "expo-build-properties",
      {
        ios: {
          newArchEnabled: false,
        },
        android: {
          newArchEnabled: false,
          minSdkVersion: 24,
          packagingOptions: {
            pickFirst: ["**/libcrypto.so"],
          },
        },
      },
    ],
    [
      "expo-alternate-app-icons",
      [
        "./assets/images/main.png",
        "./assets/images/blue.png",
        "./assets/images/gray.png",
        "./assets/images/red.png",
        "./assets/images/teal.png",
      ],
    ],
    [
      "expo-media-library",
      {
        photosPermission: "Allow $(PRODUCT_NAME) to access your photos.",
        savePhotosPermission: "Allow $(PRODUCT_NAME) to save photos.",
        isAccessMediaLocationEnabled: true,
      },
    ],
    [
      "expo-pod-pinner",
      {
        targetName: "movieweb",
        pods: [{ "OpenSSL-Universal": "1.1.2200" }],
      },
    ],
  ],
});

export default defineConfig;
