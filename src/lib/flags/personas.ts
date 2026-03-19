import { Persona } from "@/types";

export const PERSONAS: Persona[] = [
  {
    id: "user_free_01",
    name: "Free User",
    description: "A user on the free plan",
    attributes: { plan: "free", country: "US", signupDays: 30 },
  },
  {
    id: "user_premium_02",
    name: "Premium User",
    description: "A user on the premium plan",
    attributes: { plan: "premium", country: "US", signupDays: 180 },
  },
  {
    id: "user_new_03",
    name: "New Visitor",
    description: "A brand new visitor with no account",
    attributes: { plan: "none", country: "UK", signupDays: 0 },
  },
  {
    id: "user_returning_04",
    name: "Returning Customer",
    description: "A long-time customer returning to the platform",
    attributes: { plan: "pro", country: "DE", signupDays: 365 },
  },
];
