import { FlagState, FlagResult, TrackedEvent, UserContext } from "@/types";
import { FLAG_DEFINITIONS } from "./flag-definitions";

function buildInitialStates(): Map<string, FlagState> {
  const map = new Map<string, FlagState>();
  for (const def of FLAG_DEFINITIONS) {
    const variables: Record<string, unknown> = {};
    for (const v of def.variables) {
      variables[v.key] = v.value;
    }
    map.set(def.key, {
      key: def.key,
      name: def.name,
      description: def.description,
      enabled: def.enabled,
      variables,
      activeVariation: def.variations?.[0]?.name,
    });
  }
  return map;
}

let flagStates = buildInitialStates();
let events: TrackedEvent[] = [];

export function getAllFlags(): FlagState[] {
  return Array.from(flagStates.values());
}

export function getFlag(key: string): FlagState | undefined {
  return flagStates.get(key);
}

export function evaluateFlag(
  key: string,
  _userContext?: UserContext
): FlagResult {
  const state = flagStates.get(key);
  if (!state) {
    return { isEnabled: false, variables: {} };
  }

  const def = FLAG_DEFINITIONS.find((d) => d.key === key);

  if (!state.enabled) {
    // Return default values when disabled
    const defaults: Record<string, unknown> = {};
    if (def) {
      for (const v of def.variables) {
        defaults[v.key] = v.defaultValue;
      }
    }
    return { isEnabled: false, variables: defaults };
  }

  // If there are variations and an active variation, use that variation's variables
  if (def?.variations && state.activeVariation) {
    const variation = def.variations.find(
      (v) => v.name === state.activeVariation
    );
    if (variation) {
      return {
        isEnabled: true,
        variables: { ...state.variables, ...variation.variables },
        variationName: variation.name,
      };
    }
  }

  return {
    isEnabled: true,
    variables: state.variables,
    variationName: state.activeVariation,
  };
}

export function setFlagEnabled(key: string, enabled: boolean): FlagState | null {
  const state = flagStates.get(key);
  if (!state) return null;

  const def = FLAG_DEFINITIONS.find((d) => d.key === key);

  state.enabled = enabled;

  // When enabling, apply variation variables if applicable
  if (enabled && def?.variations && state.activeVariation) {
    const variation = def.variations.find(
      (v) => v.name === state.activeVariation
    );
    if (variation) {
      state.variables = { ...state.variables, ...variation.variables };
    }
  }

  return state;
}

export function setFlagVariable(
  key: string,
  variableKey: string,
  value: unknown
): FlagState | null {
  const state = flagStates.get(key);
  if (!state) return null;
  state.variables[variableKey] = value;
  return state;
}

export function setActiveVariation(
  key: string,
  variationName: string
): FlagState | null {
  const state = flagStates.get(key);
  if (!state) return null;

  const def = FLAG_DEFINITIONS.find((d) => d.key === key);
  if (!def?.variations) return null;

  const variation = def.variations.find((v) => v.name === variationName);
  if (!variation) return null;

  state.activeVariation = variationName;
  state.variables = { ...state.variables, ...variation.variables };
  return state;
}

export function resetAllFlags(): void {
  flagStates = buildInitialStates();
}

// Event tracking
export function trackEvent(event: Omit<TrackedEvent, "id" | "timestamp">): TrackedEvent {
  const tracked: TrackedEvent = {
    ...event,
    id: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
  };
  events.unshift(tracked);
  // Keep only last 100 events
  if (events.length > 100) {
    events = events.slice(0, 100);
  }
  return tracked;
}

export function getRecentEvents(limit = 50): TrackedEvent[] {
  return events.slice(0, limit);
}

export function clearEvents(): void {
  events = [];
}
