import { NextRequest, NextResponse } from "next/server";
import {
  trackEvent,
  getRecentEvents,
  clearEvents,
} from "@/lib/flags/flag-store";
import { getServerVWOClient } from "@/lib/vwo/server";
import { isMockMode } from "@/lib/vwo";

export async function GET() {
  const events = getRecentEvents();
  return NextResponse.json({ events });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  if (body.action === "clear") {
    clearEvents();
    return NextResponse.json({ success: true });
  }

  const { eventName, userId, properties } = body;

  if (!eventName || !userId) {
    return NextResponse.json(
      { error: "eventName and userId are required" },
      { status: 400 }
    );
  }

  // Track in local store (for display in admin)
  const event = trackEvent({ eventName, userId, properties });

  // Also track via VWO SDK if in real mode
  if (!isMockMode()) {
    const client = getServerVWOClient();
    await client.trackEvent(eventName, { id: userId }, properties);
  }

  return NextResponse.json({ event });
}
