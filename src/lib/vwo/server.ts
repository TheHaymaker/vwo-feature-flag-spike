import { VWOClientInterface, isMockMode } from "./index";
import { MockVWOClient } from "./mock-client";
import { RealVWOClient } from "./real-client";
import { FlagResult, UserContext } from "@/types";

let serverClient: VWOClientInterface | null = null;

export function getServerVWOClient(): VWOClientInterface {
  if (!serverClient) {
    serverClient = isMockMode() ? new MockVWOClient() : new RealVWOClient();
  }
  return serverClient;
}

export async function getServerFlag(
  key: string,
  userId = "server_default_user"
): Promise<FlagResult> {
  const client = getServerVWOClient();
  return client.getFlag(key, { id: userId });
}

export async function isFeatureEnabled(
  key: string,
  userId = "server_default_user"
): Promise<boolean> {
  const result = await getServerFlag(key, userId);
  return result.isEnabled;
}

export async function getServerFlagVariable(
  key: string,
  variableKey: string,
  defaultValue?: unknown,
  userContext?: UserContext
): Promise<unknown> {
  const result = await getServerFlag(key, userContext?.id);
  return result.variables[variableKey] ?? defaultValue;
}
