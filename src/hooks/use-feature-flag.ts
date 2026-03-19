"use client";

import { useFlags } from "@/providers/flag-provider";

export function useFeatureFlag(key: string) {
  const { getFlag, loading } = useFlags();
  const flag = getFlag(key);

  return {
    enabled: flag?.enabled ?? false,
    variables: flag?.variables ?? {},
    variationName: flag?.activeVariation,
    loading,
  };
}

export function useFeatureVariable(
  flagKey: string,
  variableKey: string,
  defaultValue?: unknown
) {
  const { variables, enabled } = useFeatureFlag(flagKey);
  if (!enabled) return defaultValue;
  return variables[variableKey] ?? defaultValue;
}
