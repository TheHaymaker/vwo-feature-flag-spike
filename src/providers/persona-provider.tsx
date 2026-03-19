"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Persona } from "@/types";
import { PERSONAS } from "@/lib/flags/personas";

interface PersonaContextValue {
  persona: Persona;
  personas: Persona[];
  setPersona: (persona: Persona) => void;
}

const PersonaContext = createContext<PersonaContextValue | null>(null);

export function PersonaProvider({ children }: { children: React.ReactNode }) {
  const [persona, setPersonaState] = useState<Persona>(PERSONAS[0]);

  const setPersona = useCallback((p: Persona) => {
    setPersonaState(p);
  }, []);

  return (
    <PersonaContext.Provider
      value={{ persona, personas: PERSONAS, setPersona }}
    >
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona must be used within PersonaProvider");
  return ctx;
}
