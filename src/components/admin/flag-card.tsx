"use client";

import { useFlags, EnrichedFlagState } from "@/providers/flag-provider";

export function FlagCard({ flag }: { flag: EnrichedFlagState }) {
  const { toggleFlag, setVariation } = useFlags();

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-lg font-semibold">{flag.name}</h3>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  flag.enabled
                    ? "bg-success/20 text-success"
                    : "bg-danger/20 text-danger"
                }`}
              >
                {flag.enabled ? "ON" : "OFF"}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{flag.description}</p>
            <code className="text-xs font-mono text-muted-foreground mt-1 block">
              {flag.key}
            </code>
          </div>
          {/* Toggle switch */}
          <button
            onClick={() => toggleFlag(flag.key, !flag.enabled)}
            className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors shrink-0 ml-4 ${
              flag.enabled ? "bg-success" : "bg-border"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                flag.enabled ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Variation selector */}
        {flag.variations.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Variations
            </p>
            <div className="flex flex-wrap gap-2">
              {flag.variations.map((v) => (
                <button
                  key={v.name}
                  onClick={() => setVariation(flag.key, v.name)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    flag.activeVariation === v.name
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {v.name}
                  <span className="ml-1 text-xs opacity-70">({v.weight}%)</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Variables display */}
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Current Variables
          </p>
          <div className="space-y-2">
            {Object.entries(flag.variables).map(([key, value]) => {
              const def = flag.variableDefinitions.find((d) => d.key === key);
              return (
                <div
                  key={key}
                  className="flex items-center justify-between text-sm"
                >
                  <code className="text-xs font-mono text-muted-foreground">
                    {key}
                  </code>
                  <div className="flex items-center gap-2">
                    {def?.type === "color" && typeof value === "string" && (
                      <span
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: value }}
                      />
                    )}
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded">
                      {typeof value === "object"
                        ? JSON.stringify(value)
                        : String(value)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
