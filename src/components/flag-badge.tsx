"use client";

export function FlagBadge({
  flagKey,
  variationName,
  enabled,
}: {
  flagKey: string;
  variationName?: string;
  enabled: boolean;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono bg-muted border border-border">
      <span
        className={`w-2 h-2 rounded-full ${enabled ? "bg-success" : "bg-danger"}`}
      />
      <span className="text-muted-foreground">{flagKey}</span>
      {variationName && (
        <>
          <span className="text-muted-foreground">/</span>
          <span className="text-foreground">{variationName}</span>
        </>
      )}
    </div>
  );
}
