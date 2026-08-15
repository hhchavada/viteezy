import { MembershipPlan } from "@/store/api/types/membership.types";
import { getCurrencySymbol } from "@/lib/utils";

export function isAnnualPlan(plan: MembershipPlan): boolean {
  const label = `${plan.name} ${plan.interval}`.toLowerCase();
  return label.includes("annual") || label.includes("year");
}

export function isQuarterlyPlan(plan: MembershipPlan): boolean {
  const label = `${plan.name} ${plan.interval}`.toLowerCase();
  return label.includes("quarter");
}

export function isBestValuePlan(plan: MembershipPlan): boolean {
  return plan.isBestValue === true;
}

export function sortMembershipPlans(plans: MembershipPlan[]): MembershipPlan[] {
  return [...plans].sort((a, b) => {
    const aBest = isBestValuePlan(a) ? 0 : 1;
    const bBest = isBestValuePlan(b) ? 0 : 1;
    if (aBest !== bBest) return aBest - bBest;
    return a.price.amount - b.price.amount;
  });
}

export function findBestValuePlanIndex(plans: MembershipPlan[]): number {
  const index = plans.findIndex((p) => isBestValuePlan(p));
  return index >= 0 ? index : 0;
}

export function formatIntervalLabel(interval?: string | null): string {
  const value = (interval ?? "").toLowerCase();
  if (value.includes("year")) return "year";
  if (value.includes("quarter")) return "quarter";
  if (value.includes("month")) return "month";
  return value;
}

export function getPlanIntervalLabel(plan: MembershipPlan): string {
  const fromInterval = formatIntervalLabel(plan.interval);
  if (fromInterval) return fromInterval;

  const fromName = formatIntervalLabel(plan.name);
  if (fromName) return fromName;

  if (isAnnualPlan(plan)) return "year";
  if (isQuarterlyPlan(plan)) return "quarter";

  if (plan.durationDays >= 360) return "year";
  if (plan.durationDays >= 85) return "quarter";
  if (plan.durationDays >= 28) return "month";

  return plan.name.trim();
}

export function formatPlanPriceLine(plan: MembershipPlan): string {
  const symbol = getCurrencySymbol(plan.price.currency);
  const amount = plan.price.amount;
  const interval = getPlanIntervalLabel(plan);

  if (isAnnualPlan(plan)) {
    return `${symbol}${amount.toFixed(0)}/${interval}`;
  }

  if (isQuarterlyPlan(plan) && plan.durationDays) {
    const yearly = (amount / plan.durationDays) * 365;
    return `${symbol}${amount.toFixed(0)}/${interval} (${symbol}${yearly.toFixed(0)}/yr)`;
  }

  return `${symbol}${amount.toFixed(2)}/${interval}`;
}

export function formatPerMonthLine(plan: MembershipPlan): string | null {
  if (!plan.durationDays || plan.durationDays < 30) return null;

  const symbol = getCurrencySymbol(plan.price.currency);
  const perMonth = (plan.price.amount / (plan.durationDays / 30)).toFixed(2);

  if (isAnnualPlan(plan)) {
    return `${symbol}${perMonth} per month · billed once a year`;
  }

  if (isQuarterlyPlan(plan)) {
    return `${symbol}${perMonth} per month · billed every quarter`;
  }

  return `${symbol}${perMonth} per month`;
}

export function getDiscountRateFromPlan(plan: MembershipPlan): number {
  for (const benefit of plan.benefits) {
    const match = benefit.match(/(\d+(?:\.\d+)?)\s*%/);
    if (match) return parseFloat(match[1]) / 100;
  }
  return 0.1;
}

export function getHeroHighlights(plans: MembershipPlan[]): string[] {
  const primary = plans.find(isBestValuePlan) ?? plans[0];
  if (!primary?.benefits?.length) return [];

  return primary.benefits.slice(0, 4);
}

export function formatPlansPickerText(plans: MembershipPlan[]): string {
  if (!plans.length) return "a membership plan";

  return sortMembershipPlans(plans)
    .map((plan) => {
      const symbol = getCurrencySymbol(plan.price.currency);
      return `${plan.name} (${symbol}${plan.price.amount.toFixed(0)})`;
    })
    .join(" or ");
}
