import { NextRequest, NextResponse } from "next/server";
import {
  getAllFlags,
  setFlagEnabled,
  setFlagVariable,
  setActiveVariation,
  resetAllFlags,
} from "@/lib/flags/flag-store";
import { FLAG_DEFINITIONS } from "@/lib/flags/flag-definitions";

export async function GET() {
  const flags = getAllFlags();
  const definitions = FLAG_DEFINITIONS;

  // Merge flag states with variation info from definitions
  const enriched = flags.map((flag) => {
    const def = definitions.find((d) => d.key === flag.key);
    return {
      ...flag,
      variations: def?.variations ?? [],
      variableDefinitions: def?.variables ?? [],
    };
  });

  return NextResponse.json({ flags: enriched });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const { key, enabled, variableKey, variableValue, variation } = body;

  if (!key) {
    return NextResponse.json({ error: "Flag key is required" }, { status: 400 });
  }

  let result;

  if (variation !== undefined) {
    result = setActiveVariation(key, variation);
  } else if (variableKey !== undefined && variableValue !== undefined) {
    result = setFlagVariable(key, variableKey, variableValue);
  } else if (enabled !== undefined) {
    result = setFlagEnabled(key, enabled);
  } else {
    return NextResponse.json({ error: "No update specified" }, { status: 400 });
  }

  if (!result) {
    return NextResponse.json({ error: "Flag not found" }, { status: 404 });
  }

  return NextResponse.json({ flag: result });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.action === "reset") {
    resetAllFlags();
    return NextResponse.json({ success: true });
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
