"use client";

import { useFeatureFlag } from "@/hooks/use-feature-flag";
import { useTrackEvent } from "@/hooks/use-track-event";
import { FlagBadge } from "@/components/flag-badge";

export default function HomePage() {
  const { enabled, variables, variationName, loading } =
    useFeatureFlag("hero_banner_test");
  const trackEvent = useTrackEvent();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const headline = (variables.headline as string) ?? "Welcome to Our Platform";
  const subheadline =
    (variables.subheadline as string) ??
    "The easiest way to manage your features and experiments.";
  const ctaText = (variables.cta_text as string) ?? "Get Started";
  const accentColor = (variables.accent_color as string) ?? "#3b82f6";

  return (
    <div className="flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(ellipse at top, ${accentColor} 0%, transparent 70%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <div className="mb-6">
              <FlagBadge
                flagKey="hero_banner_test"
                variationName={variationName}
                enabled={enabled}
              />
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              {headline}
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              {subheadline}
            </p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() =>
                  trackEvent("hero_cta_click", {
                    variation: variationName,
                    ctaText,
                  })
                }
                className="px-8 py-3 rounded-lg text-white font-medium text-lg transition-transform hover:scale-105 active:scale-95"
                style={{ backgroundColor: accentColor }}
              >
                {ctaText}
              </button>
              <button
                onClick={() =>
                  trackEvent("hero_secondary_click", {
                    variation: variationName,
                  })
                }
                className="px-8 py-3 rounded-lg border border-border font-medium text-lg hover:bg-muted transition-colors"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Client-Side Flags",
              desc: "Evaluate feature flags in React components with hooks. Changes propagate in real-time.",
              icon: "M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18",
            },
            {
              title: "Server-Side Flags",
              desc: "Evaluate flags in Server Components and API routes. No client JavaScript required.",
              icon: "M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z",
            },
            {
              title: "A/B Testing",
              desc: "Run experiments with multiple variations. Track events and measure conversions.",
              icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z",
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="p-6 rounded-xl border border-border hover:border-accent/50 transition-colors"
            >
              <svg
                className="w-8 h-8 text-accent mb-4"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d={feature.icon}
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
