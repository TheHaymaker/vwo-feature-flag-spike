"use client";

import { FlagProvider } from "@/providers/flag-provider";
import { PersonaProvider } from "@/providers/persona-provider";
import { Navbar } from "@/components/navbar";
import { ThemeSync } from "@/components/theme-provider";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <PersonaProvider>
      <FlagProvider>
        <ThemeSync />
        <Navbar />
        <main className="flex-1 flex flex-col">{children}</main>
      </FlagProvider>
    </PersonaProvider>
  );
}
