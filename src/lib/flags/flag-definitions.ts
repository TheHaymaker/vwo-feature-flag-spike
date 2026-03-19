import { FlagDefinition } from "@/types";

export const FLAG_DEFINITIONS: FlagDefinition[] = [
  {
    key: "hero_banner_test",
    name: "Hero Banner A/B Test",
    description:
      "Tests different hero banner variations with unique headlines, CTAs, and accent colors to optimize conversion.",
    enabled: true,
    variables: [
      {
        key: "headline",
        type: "string",
        value: "Welcome to Our Platform",
        defaultValue: "Welcome to Our Platform",
      },
      {
        key: "subheadline",
        type: "string",
        value: "The easiest way to manage your features and experiments.",
        defaultValue:
          "The easiest way to manage your features and experiments.",
      },
      {
        key: "cta_text",
        type: "string",
        value: "Get Started",
        defaultValue: "Get Started",
      },
      {
        key: "accent_color",
        type: "color",
        value: "#3b82f6",
        defaultValue: "#3b82f6",
      },
    ],
    variations: [
      {
        name: "Control",
        weight: 34,
        variables: {
          headline: "Welcome to Our Platform",
          subheadline:
            "The easiest way to manage your features and experiments.",
          cta_text: "Get Started",
          accent_color: "#3b82f6",
        },
      },
      {
        name: "Variation A",
        weight: 33,
        variables: {
          headline: "Supercharge Your Workflow",
          subheadline:
            "Ship faster with feature flags and real-time experimentation.",
          cta_text: "Start Free Trial",
          accent_color: "#22c55e",
        },
      },
      {
        name: "Variation B",
        weight: 33,
        variables: {
          headline: "Built for Teams That Ship",
          subheadline:
            "Release with confidence. Test everything. Learn from data.",
          cta_text: "See It In Action",
          accent_color: "#a855f7",
        },
      },
    ],
  },
  {
    key: "premium_pricing",
    name: "Premium Pricing Tier",
    description:
      "Controls visibility of the Enterprise pricing tier. When disabled, only Free and Pro tiers are shown.",
    enabled: false,
    variables: [
      {
        key: "show_enterprise",
        type: "boolean",
        value: false,
        defaultValue: false,
      },
      {
        key: "enterprise_price",
        type: "number",
        value: 99,
        defaultValue: 99,
      },
      {
        key: "badge_text",
        type: "string",
        value: "Most Popular",
        defaultValue: "Most Popular",
      },
    ],
  },
  {
    key: "dark_mode",
    name: "Dark Mode",
    description:
      "Toggles the application theme between light and dark mode via a feature flag.",
    enabled: false,
    variables: [
      {
        key: "theme",
        type: "string",
        value: "light",
        defaultValue: "light",
      },
    ],
  },
  {
    key: "new_dashboard_widget",
    name: "New Dashboard Widget",
    description:
      "Server-rendered analytics widget on the dashboard page. Demonstrates server-side flag evaluation.",
    enabled: false,
    variables: [
      {
        key: "widget_title",
        type: "string",
        value: "Analytics Overview",
        defaultValue: "Analytics Overview",
      },
      {
        key: "show_chart",
        type: "boolean",
        value: true,
        defaultValue: true,
      },
    ],
  },
];
