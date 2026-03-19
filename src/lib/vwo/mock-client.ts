import { VWOClientInterface } from "./index";
import { FlagResult, UserContext } from "@/types";
import { evaluateFlag, trackEvent } from "@/lib/flags/flag-store";

export class MockVWOClient implements VWOClientInterface {
  async getFlag(featureKey: string, userContext: UserContext): Promise<FlagResult> {
    return evaluateFlag(featureKey, userContext);
  }

  async trackEvent(
    eventName: string,
    userContext: UserContext,
    properties?: Record<string, unknown>
  ): Promise<void> {
    trackEvent({
      eventName,
      userId: userContext.id,
      properties,
    });
  }

  async setAttribute(
    _key: string,
    _value: unknown,
    _userContext: UserContext
  ): Promise<void> {
    // No-op in mock mode — attributes are handled via persona switching
  }
}
