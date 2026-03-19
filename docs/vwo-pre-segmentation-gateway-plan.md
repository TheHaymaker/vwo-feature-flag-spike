# VWO Pre-Segmentation, Gateway Service & User ID Plan

## Overview

Add VWO-authentic evaluation to mock mode: pre-segmentation (targeting rules on customVariables + gateway-resolved geo/device data), deterministic bucketing (MurmurHash on userId), decision storage, and a unique user ID per visitor via middleware. Admin overrides remain a layer above, bypassing VWO evaluation when present.

---

## VWO Concepts Being Modeled

### Pre-Segmentation
Before traffic allocation, VWO evaluates whether a user qualifies for a campaign based on segment rules matched against `customVariables`. Each flag/campaign has a `SegmentDefinition` — groups of conditions joined with AND within a group, OR across groups. If the user doesn't match, they get the disabled state.

### Gateway Service
An intermediary that resolves `ipAddress` → location data (`country`, `region`, `city`) and `userAgent` → device info (`os`, `device_type`, `browser_string`). Required for geo/device-based pre-segmentation. Without it, those segment types fail (user excluded). We mock this with simple UA regex parsing and hardcoded IP-to-geo mappings.

### User Context
```typescript
{
  id: string;                              // REQUIRED — unique user identifier
  customVariables?: Record<string, any>;   // for pre-segmentation
  userAgent?: string;                      // sent to gateway
  ipAddress?: string;                      // sent to gateway
}
```

### getFlag Evaluation Flow (what we replicate in mock)
1. Check decision storage for prior decision `(featureKey, userId)` → return stored variation
2. Resolve gateway context (IP → geo, UA → device)
3. Merge `customVariables` + gateway context into single variable map
4. Evaluate pre-segmentation rules against merged variables
5. If passes, bucket user deterministically via MurmurHash(`userId + flagKey`) → variation
6. Store decision for future calls
7. Return flag result

Same `userId` always produces same variation (deterministic). Storage persists decisions.

---

## Architecture Decisions

- **Admin overrides take priority** — cookie-based overrides from the admin panel bypass VWO evaluation entirely (matches VWO's "forced variation" / whitelisting)
- **Persona ID overrides anonymous user ID** — when a persona is active, `persona.id` is the userId and `persona.attributes` become `customVariables`; otherwise the auto-generated UUID cookie is used
- **Middleware assigns user ID** — `src/middleware.ts` sets a `vwo_user_id` cookie on first visit, available to both Server Components and API routes
- **No external hash dependency** — MurmurHash3 (32-bit) is ~30 lines, implemented inline
- **In-memory decision storage** — resets on server restart, acceptable for POC
- **Mock gateway uses hardcoded data** — simple regex UA parsing + IP range → geo lookup table

---

## New Types

**File: `src/types/index.ts`** — extend with:

```typescript
// Segment operators matching VWO's DSL
export type SegmentOperator =
  | "equals" | "not_equals"
  | "contains" | "not_contains"
  | "greater_than" | "less_than"
  | "greater_than_or_equal" | "less_than_or_equal"
  | "in_list" | "not_in_list"
  | "regex";

export interface SegmentCondition {
  variable: string;        // key in customVariables or gateway-enriched vars
  operator: SegmentOperator;
  value: unknown;
}

// AND within a group, OR across groups
export type SegmentGroup = SegmentCondition[];   // AND-joined
export type SegmentDefinition = SegmentGroup[];  // OR-joined groups

export interface GatewayContext {
  country?: string;
  region?: string;
  city?: string;
  os?: string;
  device_type?: string;     // "desktop" | "mobile" | "tablet"
  browser_string?: string;
}

export interface DecisionRecord {
  flagKey: string;
  userId: string;
  variationName: string;
  timestamp: number;
}

// Extend UserContext with gateway fields
export interface UserContext {
  id: string;
  customVariables?: Record<string, unknown>;
  userAgent?: string;
  ipAddress?: string;
}

// Extend Persona with gateway-relevant fields
export interface Persona {
  // ...existing fields...
  userAgent?: string;
  ipAddress?: string;
}

// Add segment to FlagDefinition
export interface FlagDefinition {
  // ...existing fields...
  segment?: SegmentDefinition;
}
```

---

## New Files (4 core modules)

### 1. Segment Evaluator
**New: `src/lib/vwo/segment-evaluator.ts`**

- `evaluateSegment(segment: SegmentDefinition, variables: Record<string, unknown>): boolean`
- `evaluateCondition(condition: SegmentCondition, variables: Record<string, unknown>): boolean`
- OR across groups, AND within groups
- Operator implementations: equals, not_equals, contains, not_contains, greater_than, less_than, in_list, not_in_list, regex
- Empty/undefined segment → `true` (no targeting = everyone qualifies)

### 2. Mock Gateway Service
**New: `src/lib/vwo/mock-gateway.ts`**

- `resolveGatewayContext(userAgent?: string, ipAddress?: string): GatewayContext`
- **UA parsing** (simple regex):
  - OS: Windows, Mac, Linux, Android, iOS
  - Device type: mobile (Android/iPhone), tablet (iPad), desktop (default)
  - Browser: Chrome, Firefox, Safari, Edge
- **IP-to-geo** (hardcoded lookup table):
  - `192.168.*` → US, California, San Francisco
  - `10.0.*` → UK, England, London
  - `172.16.*` → DE, Bavaria, Munich
  - `127.0.0.1` / default → US, California, San Francisco

### 3. Deterministic Bucketing
**New: `src/lib/vwo/bucketing.ts`**

- `bucketUser(userId: string, flagKey: string, variations: FlagVariation[]): FlagVariation | null`
- MurmurHash3 (32-bit) pure TypeScript implementation (~30 lines)
- Hash input: `${flagKey}_${userId}`
- Normalize hash to 0-10000 range (VWO uses 10000 buckets)
- Walk variation weights cumulatively to assign variation
- Same (userId, flagKey) → always same variation

### 4. Decision Storage
**New: `src/lib/vwo/decision-storage.ts`**

- In-memory `Map<string, DecisionRecord>` keyed by `${flagKey}_${userId}`
- `getDecision(flagKey, userId): DecisionRecord | null`
- `setDecision(flagKey, userId, variationName): void`
- `clearDecisions(): void` (for reset)
- `clearUserDecisions(userId): void` (for persona switch)

---

## New File: Middleware

### 5. User ID Middleware
**New: `src/middleware.ts`**

```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  if (!request.cookies.get("vwo_user_id")) {
    response.cookies.set("vwo_user_id", crypto.randomUUID(), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return response;
}
```

---

## Modified Files

### `src/lib/flags/flag-definitions.ts` — Add segment rules

```typescript
// hero_banner_test: no segment (all users qualify, pure A/B bucketing)

// premium_pricing: premium/pro users in US
segment: [
  [
    { variable: "plan", operator: "in_list", value: ["premium", "pro"] },
    { variable: "country", operator: "equals", value: "US" },
  ]
]

// dark_mode: established users (signupDays > 30)
segment: [
  [
    { variable: "signupDays", operator: "greater_than", value: 30 },
  ]
]

// new_dashboard_widget: desktop users only (gateway-resolved device_type)
segment: [
  [
    { variable: "device_type", operator: "equals", value: "desktop" },
  ]
]
```

**Persona × segment interaction:**
| Persona | premium_pricing | dark_mode | new_dashboard_widget |
|---------|----------------|-----------|---------------------|
| Free User (plan=free, country=US, signupDays=30) | FAIL (wrong plan) | FAIL (not > 30) | PASS (desktop UA) |
| Premium User (plan=premium, country=US, signupDays=180) | PASS | PASS | PASS |
| New Visitor (plan=none, country=UK, signupDays=0) | FAIL | FAIL | PASS (desktop UA) |
| Returning Customer (plan=pro, country=DE, signupDays=365) | FAIL (wrong country) | PASS | PASS (desktop UA) |

### `src/lib/flags/personas.ts` — Add userAgent and ipAddress

Each persona gets UA and IP fields so gateway mock resolves them differently. E.g.:
- Free User: desktop Chrome, US IP (192.168.1.100)
- Premium User: desktop Chrome, US IP (192.168.1.200)
- New Visitor: mobile Safari, UK IP (10.0.1.50)
- Returning Customer: desktop Firefox, DE IP (172.16.0.100)

### `src/lib/flags/flag-store.ts` — Rewrite evaluateFlag()

New flow:
1. Check decision storage → if found, return stored variation
2. Resolve gateway context from userAgent/ipAddress
3. Merge customVariables + gateway context
4. Evaluate pre-segmentation → if fails, return disabled
5. Deterministic bucketing → assign variation
6. Store decision
7. Return result

Signature: `evaluateFlag(key: string, userContext: UserContext, adminOverride?: FlagOverrideEntry): FlagResult`

### `src/lib/vwo/mock-client.ts` — Pass overrides into constructor

```typescript
export class MockVWOClient implements VWOClientInterface {
  private overrides: FlagOverrides;
  constructor(overrides: FlagOverrides = {}) {
    this.overrides = overrides;
  }
  async getFlag(featureKey: string, userContext: UserContext): Promise<FlagResult> {
    const override = this.overrides[featureKey];
    return evaluateFlag(featureKey, userContext, override);
  }
}
```

### `src/lib/vwo/server.ts` — Accept full UserContext

```typescript
export async function getServerFlag(key: string, userContext: UserContext): Promise<FlagResult>
```
Reads user ID cookie, admin overrides cookie, constructs MockVWOClient with overrides per request (no more singleton for mock mode).

### `src/app/api/flags/route.ts` — Use VWO pipeline

GET handler:
1. Read `vwo_user_id` cookie (generate fallback if missing)
2. Read persona cookie → look up persona attributes as customVariables
3. Read `userAgent` and IP from request headers
4. For each flag: check admin override first; if none, call `evaluateFlag(key, userContext)`
5. Return enriched results

### `src/app/api/flags/[key]/route.ts` — Same integration

### `src/app/api/events/route.ts` — Read user ID from cookie

### `src/app/dashboard/page.tsx` — Use getServerFlag with real UserContext

Read user ID cookie, request headers for UA/IP, pass to `getServerFlag`.

### `src/providers/persona-provider.tsx` — Persist persona to cookie

When persona changes, write `vwo_persona_id` cookie so server-side code can read it. Also call API to clear decisions for the previous user.

### `src/lib/flags/flag-cookies.ts` — Add user ID cookie helpers

- `USER_ID_COOKIE_NAME = "vwo_user_id"`
- `getUserIdFromCookie(cookieStore): string | null`
- `generateUserId(): string`

---

## Implementation Order

1. **Types** (`src/types/index.ts`) — foundation
2. **Segment evaluator** (`src/lib/vwo/segment-evaluator.ts`) — pure function
3. **Mock gateway** (`src/lib/vwo/mock-gateway.ts`) — pure function
4. **Bucketing** (`src/lib/vwo/bucketing.ts`) — pure function
5. **Decision storage** (`src/lib/vwo/decision-storage.ts`) — simple map
6. **User ID cookie helpers** (`src/lib/flags/flag-cookies.ts`) — extend
7. **Flag definitions with segments** (`src/lib/flags/flag-definitions.ts`) — extend
8. **Personas with UA/IP** (`src/lib/flags/personas.ts`) — extend
9. **Rewrite evaluateFlag** (`src/lib/flags/flag-store.ts`) — uses all above
10. **Update mock client** (`src/lib/vwo/mock-client.ts`) — uses new evaluateFlag
11. **Middleware** (`src/middleware.ts`) — new file
12. **Server helper** (`src/lib/vwo/server.ts`) — reads cookies, builds context
13. **API routes** (`src/app/api/flags/route.ts`, `[key]/route.ts`, `events/route.ts`)
14. **Dashboard** (`src/app/dashboard/page.tsx`) — use getServerFlag
15. **Persona provider** (`src/providers/persona-provider.tsx`) — persist to cookie
16. **Admin UI** (optional) — show segment status, bucketing info

Steps 2-8 can be parallelized (no cross-dependencies).

---

## Verification

1. `npm run build` — no TypeScript errors
2. Switch personas → different flags enable/disable based on segment rules
3. Same persona always gets same hero banner variation (deterministic bucketing)
4. New Visitor persona fails premium_pricing and dark_mode segments
5. Premium User passes all segments
6. Admin overrides still work regardless of persona/segmentation
7. Server-rendered dashboard page respects pre-segmentation
8. Refreshing page maintains same variations (decision storage + same userId)
