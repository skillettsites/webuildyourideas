// Public plans. The internal generation caps from the original spec (£5 / £10 / £20 / £30)
// are an operating limit, never shown to customers.
export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 12,
    blurb: "Your website, live on your own name.",
    features: ["Your own .com or .co.uk", "Hosting and security included", "Designed and set up for you", "Small updates each month"],
  },
  {
    id: "growth",
    name: "Growth",
    price: 25,
    blurb: "For a site that keeps changing.",
    features: ["Everything in Starter", "Twice the monthly updates", "New pages and sections", "Contact and booking forms"],
    popular: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 50,
    blurb: "When you need something custom.",
    features: ["Everything in Growth", "Four times the updates", "Custom features built for you", "Calculators, directories and tools"],
  },
  {
    id: "priority",
    name: "Priority",
    price: 100,
    blurb: "Front of the queue, every time.",
    features: ["Everything in Pro", "Six times the updates", "Your changes done first", "A personal check before every update goes live"],
  },
] as const;

export type PlanId = (typeof PLANS)[number]["id"];

export function planById(id: string) {
  return PLANS.find((p) => p.id === id) ?? null;
}

// Monthly change allowance for client accounts, in units. Customers only ever see a
// percentage. Units line up with the original spec's internal caps (£5/£10/£20/£30).
export const PLAN_ALLOWANCE: Record<PlanId, number> = { starter: 5, growth: 10, pro: 20, priority: 30 };

export const SIZE_UNITS = { small: 1, medium: 3, large: 8 } as const;
export type RequestSize = keyof typeof SIZE_UNITS;

export const SIZE_LABEL: Record<RequestSize, string> = {
  small: "Small change",
  medium: "Medium change",
  large: "Large change",
};

export const PLAN_PERKS: Record<PlanId, string[]> = {
  starter: ["Your site hosted, secured and kept up to date", "Small updates each month"],
  growth: ["Twice the monthly updates", "New pages and sections"],
  pro: ["Four times the updates", "Custom features built for you"],
  priority: ["Your requests go to the front of the queue", "A personal check before every update goes live", "Six times the monthly updates"],
};
