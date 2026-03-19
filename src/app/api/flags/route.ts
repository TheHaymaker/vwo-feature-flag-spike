import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FLAG_DEFINITIONS } from "@/lib/flags/flag-definitions";
import {
  COOKIE_NAME,
  parseFlagOverrides,
  serializeFlagOverrides,
  buildFlagStatesFromOverrides,
  FlagOverrides,
} from "@/lib/flags/flag-cookies";

export async function GET() {
  const cookieStore = await cookies();
  const overrides = parseFlagOverrides(cookieStore.get(COOKIE_NAME)?.value);
  const flags = buildFlagStatesFromOverrides(overrides);

  const enriched = flags.map((flag) => {
    const def = FLAG_DEFINITIONS.find((d) => d.key === flag.key);
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
  const { key, enabled, variation, variableKey, variableValue } = body;

  if (!key) {
    return NextResponse.json({ error: "Flag key is required" }, { status: 400 });
  }

  // Read current overrides from cookie
  const cookieStore = await cookies();
  const overrides = parseFlagOverrides(cookieStore.get(COOKIE_NAME)?.value);

  // Apply the change
  if (!overrides[key]) {
    const def = FLAG_DEFINITIONS.find((d) => d.key === key);
    overrides[key] = {
      enabled: def?.enabled ?? false,
      variation: def?.variations?.[0]?.name,
    };
  }

  if (enabled !== undefined) {
    overrides[key].enabled = enabled;
  }
  if (variation !== undefined) {
    overrides[key].variation = variation;
  }
  if (variableKey !== undefined && variableValue !== undefined) {
    if (!overrides[key].variables) {
      overrides[key].variables = {};
    }
    overrides[key].variables![variableKey] = variableValue;
  }

  // Write updated overrides back to cookie
  const cookieValue = serializeFlagOverrides(overrides);
  const response = NextResponse.json({
    flag: buildFlagStatesFromOverrides(overrides).find((f) => f.key === key),
    overrides,
  });

  response.cookies.set(COOKIE_NAME, cookieValue, {
    path: "/",
    httpOnly: false, // Client JS needs to read this for polling
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return response;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  if (body.action === "reset") {
    const emptyOverrides: FlagOverrides = {};
    const cookieValue = serializeFlagOverrides(emptyOverrides);
    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, cookieValue, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  }
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
