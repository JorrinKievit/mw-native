import CheckIosAppIdModule from "./src/CheckIosAppIdModule";

export function isIncorrectAppId(): boolean {
  return CheckIosAppIdModule.isIncorrectAppId();
}

export function getAppId(): string {
  return CheckIosAppIdModule.getAppId();
}
