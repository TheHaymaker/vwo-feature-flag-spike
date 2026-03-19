import { FlagResult, UserContext } from "@/types";

export interface VWOClientInterface {
  getFlag(featureKey: string, userContext: UserContext): Promise<FlagResult>;
  trackEvent(
    eventName: string,
    userContext: UserContext,
    properties?: Record<string, unknown>
  ): Promise<void>;
  setAttribute(
    key: string,
    value: unknown,
    userContext: UserContext
  ): Promise<void>;
}

export function isMockMode(): boolean {
  return !process.env.VWO_ACCOUNT_ID || !process.env.VWO_SDK_KEY;
}
