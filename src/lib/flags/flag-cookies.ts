import { FlagState } from "@/types";
import { FLAG_DEFINITIONS } from "./flag-definitions";

const COOKIE_NAME = "vwo_flag_overrides";

export interface FlagOverrides {
  [flagKey: string]: {
    enabled: boolean;
    variation?: string;
  };
}

/**
 * Parse the flag overrides cookie value into a typed object.
 */
export function parseFlagOverrides(cookieValue: string | undefined): FlagOverrides {
  if (!cookieValue) return {};
  try {
    return JSON.parse(decodeURIComponent(cookieValue));
  } catch {
    return {};
  }
}

/**
 * Serialize flag overrides to a cookie value string.
 */
export function serializeFlagOverrides(overrides: FlagOverrides): string {
  return encodeURIComponent(JSON.stringify(overrides));
}

/**
 * Build the full flag states by merging definitions with cookie overrides.
 * This is the single source of truth used by both server and client reads.
 */
export function buildFlagStatesFromOverrides(
  overrides: FlagOverrides
): FlagState[] {
  return FLAG_DEFINITIONS.map((def) => {
    const override = overrides[def.key];
    const enabled = override?.enabled ?? def.enabled;
    const activeVariation = override?.variation ?? def.variations?.[0]?.name;

    const variables: Record<string, unknown> = {};
    for (const v of def.variables) {
      variables[v.key] = v.value;
    }

    // If enabled and has an active variation, merge variation variables
    if (enabled && def.variations && activeVariation) {
      const variation = def.variations.find((v) => v.name === activeVariation);
      if (variation) {
        Object.assign(variables, variation.variables);
      }
    }

    return {
      key: def.key,
      name: def.name,
      description: def.description,
      enabled,
      variables,
      activeVariation,
    };
  });
}

export { COOKIE_NAME };
