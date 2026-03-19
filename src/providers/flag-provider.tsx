"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { FlagState, FlagVariation, FlagVariable } from "@/types";

export interface EnrichedFlagState extends FlagState {
  variations: FlagVariation[];
  variableDefinitions: FlagVariable[];
}

interface FlagContextValue {
  flags: EnrichedFlagState[];
  loading: boolean;
  getFlag: (key: string) => EnrichedFlagState | undefined;
  toggleFlag: (key: string, enabled: boolean) => Promise<void>;
  setVariation: (key: string, variation: string) => Promise<void>;
  setVariable: (
    key: string,
    variableKey: string,
    value: unknown
  ) => Promise<void>;
  resetAll: () => Promise<void>;
  refetch: () => Promise<void>;
}

const FlagContext = createContext<FlagContextValue | null>(null);

export function FlagProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<EnrichedFlagState[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchFlags = useCallback(async () => {
    try {
      const res = await fetch("/api/flags");
      const data = await res.json();
      setFlags(data.flags);
    } catch (err) {
      console.error("Failed to fetch flags:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFlags();
    // Poll every 2 seconds for flag changes
    intervalRef.current = setInterval(fetchFlags, 2000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchFlags]);

  const getFlag = useCallback(
    (key: string) => flags.find((f) => f.key === key),
    [flags]
  );

  const toggleFlag = useCallback(
    async (key: string, enabled: boolean) => {
      await fetch("/api/flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, enabled }),
      });
      await fetchFlags();
    },
    [fetchFlags]
  );

  const setVariation = useCallback(
    async (key: string, variation: string) => {
      await fetch("/api/flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, variation }),
      });
      await fetchFlags();
    },
    [fetchFlags]
  );

  const setVariable = useCallback(
    async (key: string, variableKey: string, value: unknown) => {
      await fetch("/api/flags", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, variableKey, variableValue: value }),
      });
      await fetchFlags();
    },
    [fetchFlags]
  );

  const resetAll = useCallback(async () => {
    await fetch("/api/flags", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reset" }),
    });
    await fetchFlags();
  }, [fetchFlags]);

  return (
    <FlagContext.Provider
      value={{
        flags,
        loading,
        getFlag,
        toggleFlag,
        setVariation,
        setVariable,
        resetAll,
        refetch: fetchFlags,
      }}
    >
      {children}
    </FlagContext.Provider>
  );
}

export function useFlags() {
  const ctx = useContext(FlagContext);
  if (!ctx) throw new Error("useFlags must be used within FlagProvider");
  return ctx;
}
