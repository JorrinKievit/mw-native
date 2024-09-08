import { requireNativeModule } from "expo-modules-core";

export enum MarketplaceSource {
  AppStore = "App Store",
  TestFlight = "TestFlight",
  Marketplace = "Alternative marketplace",
  Web = "Website",
  Other = "Other",
  Unknown = "Unknown",
  Error = "Error",
  Unavailable = "Unavailable",
}

interface CheckIosMarketplaceModule {
  getCurrentMarketplaceAsync(): Promise<MarketplaceSource>;
}

// It loads the native module object from the JSI or falls back to
// the bridge module (from NativeModulesProxy) if the remote debugger is on.
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
export default requireNativeModule(
  "CheckIosMarketplace",
) as CheckIosMarketplaceModule;
