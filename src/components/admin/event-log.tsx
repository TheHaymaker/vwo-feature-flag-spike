"use client";

import { useCallback, useEffect, useState } from "react";
import { TrackedEvent } from "@/types";

export function EventLog() {
  const [events, setEvents] = useState<TrackedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch("/api/events");
      const data = await res.json();
      setEvents(data.events);
    } catch (err) {
      console.error("Failed to fetch events:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 2000);
    return () => clearInterval(interval);
  }, [fetchEvents]);

  const clearEvents = async () => {
    await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "clear" }),
    });
    setEvents([]);
  };

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-6 py-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Event Log</h2>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
            {events.length} events
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            Live
          </span>
        </div>
        <button
          onClick={clearEvents}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          Clear
        </button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            Loading events...
          </div>
        ) : events.length === 0 ? (
          <div className="p-6 text-center text-muted-foreground text-sm">
            No events tracked yet. Click buttons on the demo pages to generate
            events.
          </div>
        ) : (
          <div className="divide-y divide-border">
            {events.map((event) => (
              <div
                key={event.id}
                className="px-6 py-3 flex items-center justify-between hover:bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <div>
                    <code className="text-sm font-mono font-medium">
                      {event.eventName}
                    </code>
                    <p className="text-xs text-muted-foreground">
                      User: {event.userId}
                      {event.properties &&
                        Object.keys(event.properties).length > 0 && (
                          <span className="ml-2">
                            {JSON.stringify(event.properties)}
                          </span>
                        )}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
