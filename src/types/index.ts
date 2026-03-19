export interface FlagVariable {
  key: string;
  type: "string" | "number" | "boolean" | "json" | "color";
  value: unknown;
  defaultValue: unknown;
}

export interface FlagVariation {
  name: string;
  weight: number;
  variables: Record<string, unknown>;
}

export interface FlagDefinition {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  variables: FlagVariable[];
  variations?: FlagVariation[];
}

export interface FlagState {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  variables: Record<string, unknown>;
  activeVariation?: string;
}

export interface FlagResult {
  isEnabled: boolean;
  variables: Record<string, unknown>;
  variationName?: string;
}

export interface UserContext {
  id: string;
  customVariables?: Record<string, unknown>;
}

export interface TrackedEvent {
  id: string;
  eventName: string;
  userId: string;
  properties?: Record<string, unknown>;
  timestamp: number;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  attributes: Record<string, unknown>;
}
