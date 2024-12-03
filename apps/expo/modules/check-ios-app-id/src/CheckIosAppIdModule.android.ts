import { UnavailabilityError } from "expo-modules-core";

export default {
  isIncorrectAppId(): boolean {
    throw new UnavailabilityError("CheckIosAppId", "isIncorrectAppId");
  },
  getAppId(): string {
    throw new UnavailabilityError("CheckIosAppId", "getAppId");
  },
};
