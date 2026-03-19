import { NextRequest, NextResponse } from "next/server";
import { evaluateFlag } from "@/lib/flags/flag-store";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;
  const userId =
    new URL(_request.url).searchParams.get("userId") ?? "default_user";

  const result = evaluateFlag(key, { id: userId });
  return NextResponse.json(result);
}
