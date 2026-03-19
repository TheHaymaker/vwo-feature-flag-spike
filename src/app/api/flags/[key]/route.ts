import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  COOKIE_NAME,
  parseFlagOverrides,
  buildFlagStatesFromOverrides,
} from "@/lib/flags/flag-cookies";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const cookieStore = await cookies();
  const overrides = parseFlagOverrides(cookieStore.get(COOKIE_NAME)?.value);
  const flags = buildFlagStatesFromOverrides(overrides);
  const flag = flags.find((f) => f.key === key);

  if (!flag) {
    return NextResponse.json({ isEnabled: false, variables: {} });
  }

  return NextResponse.json({
    isEnabled: flag.enabled,
    variables: flag.variables,
    variationName: flag.activeVariation,
  });
}
