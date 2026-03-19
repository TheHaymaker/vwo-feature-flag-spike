"use client";

import { useFlags } from "@/providers/flag-provider";
import { FlagCard } from "@/components/admin/flag-card";
import { EventLog } from "@/components/admin/event-log";

export default function AdminPage() {
  const { flags, loading, resetAll } = useFlags();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">
          Loading flags...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            Feature Flag Admin
          </h1>
          <p className="text-muted-foreground">
            Toggle flags, switch variations, and monitor events in real-time.
            Changes take effect immediately across the app.
          </p>
        </div>
        <button
          onClick={resetAll}
          className="px-4 py-2 rounded-lg border border-border text-sm font-medium hover:bg-muted transition-colors"
        >
          Reset All Flags
        </button>
      </div>

      {/* Mode indicator */}
      <div className="mb-8 p-4 rounded-lg bg-muted border border-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          <span className="text-sm font-medium">Mock Mode</span>
          <span className="text-sm text-muted-foreground">
            — Using local flag store. Set{" "}
            <code className="px-1 py-0.5 bg-background rounded text-xs font-mono">
              VWO_ACCOUNT_ID
            </code>{" "}
            and{" "}
            <code className="px-1 py-0.5 bg-background rounded text-xs font-mono">
              VWO_SDK_KEY
            </code>{" "}
            in{" "}
            <code className="px-1 py-0.5 bg-background rounded text-xs font-mono">
              .env.local
            </code>{" "}
            to connect to VWO.
          </span>
        </div>
      </div>

      {/* Flag cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-12">
        {flags.map((flag) => (
          <FlagCard key={flag.key} flag={flag} />
        ))}
      </div>

      {/* Event log */}
      <EventLog />
    </div>
  );
}
