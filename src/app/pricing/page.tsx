"use client";

import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useTrackEvent } from "@/hooks/use-track-event";
import { FlagBadge } from "@/components/flag-badge";

interface PricingTier {
  name: string;
  price: number | string;
  description: string;
  features: string[];
  highlighted?: boolean;
  badge?: string;
}

const BASE_TIERS: PricingTier[] = [
  {
    name: "Free",
    price: 0,
    description: "Get started with the basics",
    features: [
      "Up to 1,000 MAU",
      "3 feature flags",
      "Basic analytics",
      "Community support",
    ],
  },
  {
    name: "Pro",
    price: 29,
    description: "For growing teams",
    features: [
      "Up to 50,000 MAU",
      "Unlimited feature flags",
      "A/B testing",
      "Advanced analytics",
      "Priority support",
    ],
    highlighted: true,
  },
];

export default function PricingPage() {
  const { enabled, variables } = useFeatureFlag("premium_pricing");
  const trackEvent = useTrackEvent();

  const badgeText = (variables.badge_text as string) ?? "Most Popular";
  const enterprisePrice = (variables.enterprise_price as number) ?? 99;

  const tiers: PricingTier[] = [
    ...BASE_TIERS,
    ...(enabled
      ? [
          {
            name: "Enterprise",
            price: enterprisePrice,
            description: "For large organizations",
            features: [
              "Unlimited MAU",
              "Unlimited feature flags",
              "Multi-environment",
              "SSO & SAML",
              "Dedicated support",
              "Custom SLA",
            ],
            badge: badgeText,
          },
        ]
      : []),
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <div className="mb-4">
          <FlagBadge
            flagKey="premium_pricing"
            enabled={enabled}
          />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Simple, Transparent Pricing
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Choose the plan that fits your needs. Upgrade or downgrade at any
          time.
        </p>
      </div>

      <div
        className={`grid gap-8 max-w-5xl mx-auto ${
          tiers.length === 3
            ? "grid-cols-1 md:grid-cols-3"
            : "grid-cols-1 md:grid-cols-2"
        }`}
      >
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl border p-8 flex flex-col ${
              tier.highlighted
                ? "border-accent shadow-lg shadow-accent/10"
                : tier.badge
                  ? "border-accent/50 shadow-md"
                  : "border-border"
            }`}
          >
            {tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                {tier.badge}
              </div>
            )}
            {tier.highlighted && !tier.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                Popular
              </div>
            )}
            <h2 className="text-2xl font-bold">{tier.name}</h2>
            <p className="text-muted-foreground mt-2 text-sm">
              {tier.description}
            </p>
            <div className="mt-6 mb-8">
              <span className="text-4xl font-bold">
                {tier.price === 0 ? "Free" : `$${tier.price}`}
              </span>
              {tier.price !== 0 && (
                <span className="text-muted-foreground">/mo</span>
              )}
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <svg
                    className="w-4 h-4 text-success shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>
            <button
              onClick={() =>
                trackEvent("pricing_tier_click", { tier: tier.name })
              }
              className={`w-full py-3 rounded-lg font-medium transition-colors ${
                tier.highlighted || tier.badge
                  ? "bg-accent text-accent-foreground hover:opacity-90"
                  : "border border-border hover:bg-muted"
              }`}
            >
              {tier.price === 0 ? "Get Started Free" : "Start Free Trial"}
            </button>
          </div>
        ))}
      </div>

      {!enabled && (
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Enterprise tier is currently hidden by the{" "}
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              premium_pricing
            </code>{" "}
            feature flag. Enable it in the{" "}
            <a href="/admin" className="text-accent hover:underline">
              Admin Dashboard
            </a>{" "}
            to reveal it.
          </p>
        </div>
      )}
    </div>
  );
}
