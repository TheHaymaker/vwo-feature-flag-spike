"use client";

import { useEffect } from "react";
import { useFeatureFlag } from "@/hooks/use-feature-flag";

export function ThemeSync() {
  const { enabled } = useFeatureFlag("dark_mode");

  useEffect(() => {
    if (enabled) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [enabled]);

  return null;
}
