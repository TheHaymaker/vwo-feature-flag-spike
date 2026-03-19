"use client";

import { useCallback } from "react";
import { usePersona } from "@/providers/persona-provider";

export function useTrackEvent() {
  const { persona } = usePersona();

  return useCallback(
    async (eventName: string, properties?: Record<string, unknown>) => {
      try {
        await fetch("/api/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventName,
            userId: persona.id,
            properties,
          }),
        });
      } catch (err) {
        console.error("Failed to track event:", err);
      }
    },
    [persona.id]
  );
}
