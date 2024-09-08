import { UnavailabilityError } from "expo-modules-core";

export default {
  getCurrentMarketplaceAsync: () => {
    throw new UnavailabilityError(
      "CheckIosMarketplace",
      "getCurrentMarketplaceAsync",
    );
  },
};
