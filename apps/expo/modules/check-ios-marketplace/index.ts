import type { MarketplaceSource } from "./src/CheckIosMarketplaceModule";
import CheckIosMarketplaceModule from "./src/CheckIosMarketplaceModule";

export async function getCurrentMarketplaceAsync(): Promise<MarketplaceSource> {
  return CheckIosMarketplaceModule.getCurrentMarketplaceAsync();
}
