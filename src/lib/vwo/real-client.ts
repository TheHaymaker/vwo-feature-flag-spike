import { VWOClientInterface } from "./index";
import { FlagResult, UserContext } from "@/types";

let vwoInstance: unknown = null;

async function getVWOInstance() {
  if (vwoInstance) return vwoInstance;

  try {
    // Dynamic import to avoid issues when vwo-fme-node-sdk isn't configured
    const { init } = await import("vwo-fme-node-sdk");
    vwoInstance = await init({
      accountId: process.env.VWO_ACCOUNT_ID!,
      sdkKey: process.env.VWO_SDK_KEY!,
    });
    return vwoInstance;
  } catch (error) {
    console.error("Failed to initialize VWO SDK:", error);
    return null;
  }
}

export class RealVWOClient implements VWOClientInterface {
  async getFlag(featureKey: string, userContext: UserContext): Promise<FlagResult> {
    const client = await getVWOInstance();
    if (!client) {
      return { isEnabled: false, variables: {} };
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const flag = await (client as any).getFlag(featureKey, {
        id: userContext.id,
        customVariables: userContext.customVariables,
      });

      const isEnabled = flag.isEnabled();
      const variables: Record<string, unknown> = {};

      // Extract variables from the flag
      if (flag.getVariables) {
        const vars = flag.getVariables();
        if (vars && typeof vars === "object") {
          Object.assign(variables, vars);
        }
      }

      return { isEnabled, variables };
    } catch (error) {
      console.error(`Error evaluating flag ${featureKey}:`, error);
      return { isEnabled: false, variables: {} };
    }
  }

  async trackEvent(
    eventName: string,
    userContext: UserContext,
    properties?: Record<string, unknown>
  ): Promise<void> {
    const client = await getVWOInstance();
    if (!client) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).trackEvent(
        eventName,
        { id: userContext.id, customVariables: userContext.customVariables },
        properties
      );
    } catch (error) {
      console.error(`Error tracking event ${eventName}:`, error);
    }
  }

  async setAttribute(
    key: string,
    value: unknown,
    userContext: UserContext
  ): Promise<void> {
    const client = await getVWOInstance();
    if (!client) return;

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (client as any).setAttribute(key, value, {
        id: userContext.id,
        customVariables: userContext.customVariables,
      });
    } catch (error) {
      console.error(`Error setting attribute ${key}:`, error);
    }
  }
}
