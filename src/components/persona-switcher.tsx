"use client";

import { useState, useRef, useEffect } from "react";
import { usePersona } from "@/providers/persona-provider";

export function PersonaSwitcher() {
  const { persona, personas, setPersona } = usePersona();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-muted hover:bg-border transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-success" />
        <span>{persona.name}</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-64 bg-background border border-border rounded-lg shadow-lg overflow-hidden z-50">
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              User Persona
            </p>
          </div>
          {personas.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPersona(p);
                setOpen(false);
              }}
              className={`w-full text-left px-3 py-3 hover:bg-muted transition-colors ${
                persona.id === p.id ? "bg-muted" : ""
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.description}
                  </p>
                </div>
                {persona.id === p.id && (
                  <svg
                    className="w-4 h-4 text-success"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
