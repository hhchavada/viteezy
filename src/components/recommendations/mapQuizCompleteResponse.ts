import type {
  QuizActiveMembership,
  QuizBundleItem,
  QuizCompleteData,
  QuizCompleteMembership,
  QuizMembershipDiscount,
  QuizMembershipPlan,
  QuizPlanPricing,
} from "@/store/api/types/healthQuiz.types";
import { formatCurrencyAmount } from "@/lib/utils";
import type { PlanSummary, PlanTier } from "@/types/recommendations";
import type {
  ActiveMembershipInfo,
  AddOnProduct,
  MembershipOption,
  MembershipSectionData,
  OrderLineItem,
  Supplement,
} from "@/types/recommendations";

export interface PlanPricing {
  subtotal: number;
  productSubtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  membershipDiscount?: {
    label: string;
    percentage?: number;
    amount: number;
  } | null;
}

export interface RecommendationsPageData {
  userName: string;
  sessionId?: string;
  recommendationId?: string;
  severityLevel?: string;
  defaultTier: PlanTier;
  essentialSupplements: Supplement[];
  advancedSupplements: Supplement[];
  essentialPlan: PlanSummary;
  advancedPlan: PlanSummary;
  noticeMessage: string;
  essentialPricing: PlanPricing;
  advancedPricing: PlanPricing;
  membership: MembershipSectionData;
  addOnProducts: AddOnProduct[];
  hasApiData: boolean;
}

const DEFAULT_MEMBERSHIP_SECTION: MembershipSectionData = {
  title: "Add Membership",
  subtitle: "Longer commitments unlock better pricing and premium perks.",
  hasActiveMembership: false,
  activeMembership: null,
  plans: [],
};

function getStoredUserName(): string {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}") as {
      firstName?: string;
      name?: string;
    };

    return user.firstName || user.name || "you";
  } catch {
    return "you";
  }
}

/** Read user name from localStorage — only call after mount (e.g. in useEffect). */
export function readStoredUserName(): string {
  if (typeof window === "undefined") return "you";
  return getStoredUserName();
}

function normalizeProductImageUrl(image?: string | null): string {
  const trimmed = image?.trim() || "";
  if (!trimmed) return "";
  if (trimmed.startsWith("/")) return trimmed;

  const absolute = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  if (/^https?:\/\//i.test(absolute)) {
    try {
      new URL(absolute);
      return absolute;
    } catch {
      return "";
    }
  }

  return "";
}

function toNumber(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveCurrencyCode(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed.toUpperCase();
  }
  return undefined;
}

function resolveCurrencyFromBundle(
  bundle: QuizBundleItem[] | undefined
): string | undefined {
  if (!bundle?.length) return undefined;

  for (const item of bundle) {
    const currency = resolveCurrencyCode(
      item.pricing?.currency,
      item.product?.price?.currency
    );
    if (currency) return currency;
  }

  return undefined;
}

function resolveRecommendationCurrency(
  data?: QuizCompleteData | null
): string {
  if (!data) return "EUR";

  return (
    resolveCurrencyCode(
      data.pricing?.essential?.currency,
      data.pricing?.advanced?.currency,
      data.membership?.activeMembership?.price?.currency,
      data.membership?.plans?.[0]?.price?.currency
    ) ||
    resolveCurrencyFromBundle(data.essentialBundle) ||
    resolveCurrencyFromBundle(data.advancedBundle) ||
    resolveCurrencyFromBundle(data.addonProducts) ||
    "EUR"
  );
}

function resolveItemCurrency(
  item: QuizBundleItem,
  fallbackCurrency: string
): string {
  return (
    resolveCurrencyCode(
      item.pricing?.currency,
      item.product?.price?.currency
    ) || fallbackCurrency
  );
}

function formatMoney(amount: number, currency = "EUR"): string {
  return formatCurrencyAmount(amount, currency);
}

export function getDefaultTierFromSeverity(severityLevel?: string): PlanTier {
  const level = severityLevel?.toLowerCase();
  if (level === "high" || level === "severe") {
    return "advanced";
  }
  return "essential";
}

function isBundleItemRemoved(item: QuizBundleItem): boolean {
  return (
    item.isUserRemoved === true ||
    item.isRemoved === true ||
    item.removed === true
  );
}

function isBundleItemActive(item: QuizBundleItem): boolean {
  return item.isDisabled !== true && !isBundleItemRemoved(item);
}

function isSupplementActive(item: Supplement): boolean {
  return (
    !item.disabled &&
    !item.removed &&
    item.isUserRemoved !== true
  );
}

function getItemDosage(item: QuizBundleItem): number {
  const dosage = toNumber(item.dosage, 0);
  if (dosage > 0) return dosage;

  if (item.amDosage != null || item.pmDosage != null) {
    return toNumber(item.amDosage, 0) + toNumber(item.pmDosage, 0);
  }

  return toNumber(item.pricing?.dailyPillCount ?? item.pillCount, 0);
}

function getItemDailyPillCount(item: QuizBundleItem): number {
  return getItemDosage(item);
}

function getSupplementNames(bundle: QuizBundleItem[]): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  bundle.forEach((item) => {
    if (!isBundleItemActive(item)) return;

    const productId = item.product?._id;
    const title = item.product?.title?.trim();
    if (!productId || !title || seen.has(productId)) return;
    seen.add(productId);
    names.push(title);
  });

  return names;
}

function resolveSupplementDescription(item: QuizBundleItem): string | undefined {
  const product = item.product;
  const candidates = [
    item.recommendationReason,
    item.description,
    item.shortDescription,
    product?.description,
    product?.shortDescription,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

function mapBundleToSupplements(
  bundle: QuizBundleItem[],
  fallbackCurrency = "EUR"
): Supplement[] {
  const grouped = new Map<string, Supplement>();

  bundle.forEach((item, index) => {
    const product = item.product;
    if (!product?._id) return;

    const dosage = getItemDosage(item);
    const dailyPills = getItemDailyPillCount(item);
    const originalPrice = toNumber(
      item.pricing?.original ?? product.price?.amount,
      0
    );
    const currentPrice = toNumber(
      product.price?.discountedPrice ??
        item.pricing?.monthly ??
        product.price?.amount,
      originalPrice
    );
    const currency = resolveItemCurrency(item, fallbackCurrency);

    const existing = grouped.get(product._id);

    if (existing) {
      existing.dosage += dosage;
      existing.pillsCount = existing.dosage;
      existing.disabled = existing.disabled || item.isDisabled === true;
      existing.removed = existing.removed || isBundleItemRemoved(item);
      existing.isUserRemoved = existing.isUserRemoved || item.isUserRemoved === true;
      if (!existing.currency) {
        existing.currency = currency;
      }
      if (!existing.description) {
        existing.description = resolveSupplementDescription(item);
      }
      return;
    }

    grouped.set(product._id, {
      id: product._id,
      name: product.title || `Supplement ${index + 1}`,
      imageUrl: normalizeProductImageUrl(product.productImage),
      goalLabel: item.isGoalRequired ? "Goal-Required" : "Recommended",
      pillsCount: dailyPills,
      originalPrice,
      currentPrice,
      dosage,
      currency,
      disabled: item.isDisabled === true,
      removed: isBundleItemRemoved(item),
      isUserRemoved: item.isUserRemoved === true,
      description: resolveSupplementDescription(item),
    });
  });

  return Array.from(grouped.values()).map((supplement) => ({
    ...supplement,
    pillsCount: supplement.dosage || supplement.pillsCount,
  }));
}

function computePillsPerDay(supplements: Supplement[]): number {
  return supplements
    .filter(isSupplementActive)
    .reduce((sum, item) => sum + item.dosage, 0);
}

function computeBundlePillsPerDay(bundle: QuizBundleItem[]): number {
  return bundle
    .filter(isBundleItemActive)
    .reduce((sum, item) => sum + getItemDailyPillCount(item), 0);
}

function buildPlanSummary(
  bundle: QuizBundleItem[],
  pricing?: QuizPlanPricing,
  fallbackCurrency = "EUR"
): PlanSummary {
  const currency =
    resolveCurrencyCode(pricing?.currency) ||
    resolveCurrencyFromBundle(bundle) ||
    fallbackCurrency;
  const supplements = mapBundleToSupplements(bundle, currency);
  const activeSupplements = supplements.filter(isSupplementActive);
  const pillsPerDay =
    computePillsPerDay(supplements) || computeBundlePillsPerDay(bundle);

  return {
    supplementCount: activeSupplements.length,
    pillsPerDay,
    monthlyPrice: toNumber(
      pricing?.total ?? pricing?.discountedSubtotal ?? pricing?.subtotal,
      0
    ),
    currency,
    supplementNames: getSupplementNames(bundle),
  };
}

function normalizeMembershipDiscount(
  membershipDiscount?: QuizMembershipDiscount | null
): PlanPricing["membershipDiscount"] {
  if (!membershipDiscount) return null;

  const amount = toNumber(membershipDiscount.amount, 0);
  if (amount === 0) return null;

  const label = membershipDiscount.label?.trim();
  if (!label) return null;

  return {
    label,
    percentage: membershipDiscount.percentage,
    amount,
  };
}

function formatMembershipDiscountValue(amount: number, currency: string): string {
  return `-${formatMoney(Math.abs(amount), currency)}`;
}

function mapPlanPricing(
  pricing?: QuizPlanPricing,
  fallbackTotal = 0,
  fallbackCurrency = "EUR"
): PlanPricing {
  const currency =
    resolveCurrencyCode(pricing?.currency) || fallbackCurrency;
  const subtotal = toNumber(
    pricing?.productSubtotal ?? pricing?.subtotal,
    fallbackTotal
  );
  const membershipDiscount = normalizeMembershipDiscount(
    pricing?.membershipDiscount
  );

  return {
    subtotal,
    productSubtotal: subtotal,
    shipping: toNumber(pricing?.shipping, 0),
    tax: toNumber(pricing?.tax, 0),
    total: toNumber(pricing?.total, fallbackTotal),
    currency,
    membershipDiscount,
  };
}

function buildNoticeMessage(
  essentialBundle: QuizBundleItem[],
  advancedBundle: QuizBundleItem[]
): string {
  const essentialPills = computePillsPerDay(mapBundleToSupplements(essentialBundle));
  const advancedPills = computePillsPerDay(mapBundleToSupplements(advancedBundle));

  if (advancedPills > essentialPills) {
    return `Your Advanced plan is ${advancedPills} pills/day. To keep your daily dose manageable, consider keeping it at ${essentialPills} pills and rotating other SKUs into your renewals`;
  }

  return "Your personalized plan is ready. Review your essentials and adjust doses to match your routine.";
}

function mapMembershipPlan(
  plan: QuizMembershipPlan,
  fallbackCurrency = "EUR"
): MembershipOption {
  return {
    id: plan.planId,
    name: plan.name || plan.label || "Membership",
    label: plan.label || plan.interval || plan.name || "Plan",
    badge: plan.savingsBadge ?? null,
    price: toNumber(plan.price?.amount, 0),
    currency:
      resolveCurrencyCode(plan.price?.currency) || fallbackCurrency,
    active: plan.isSelected,
    action: plan.action,
    benefits: plan.benefits ?? [],
    shortDescription: plan.shortDescription,
    isBestValue: plan.isBestValue,
  };
}

function mapActiveMembership(
  membership: QuizActiveMembership,
  fallbackCurrency = "EUR"
): ActiveMembershipInfo | null {
  if (!membership.membershipId && !membership.planId) return null;

  return {
    membershipId: membership.membershipId || membership.planId || "",
    planId: membership.planId || membership.membershipId || "",
    name: membership.name || "Membership",
    label: membership.label || membership.interval || membership.name || "Plan",
    interval: membership.interval || membership.label || "",
    price: toNumber(membership.price?.amount, 0),
    currency:
      resolveCurrencyCode(membership.price?.currency) || fallbackCurrency,
    savingsBadge: membership.savingsBadge ?? null,
    expiresAt: membership.expiresAt || "",
    benefits: membership.benefits ?? [],
  };
}

function mapMembershipSection(
  membership?: QuizCompleteMembership | null,
  fallbackCurrency = "EUR"
): MembershipSectionData {
  if (!membership?.plans?.length && !membership?.activeMembership) {
    return {
      ...DEFAULT_MEMBERSHIP_SECTION,
      title: membership?.title || DEFAULT_MEMBERSHIP_SECTION.title,
      subtitle: membership?.subtitle || DEFAULT_MEMBERSHIP_SECTION.subtitle,
    };
  }

  return {
    title: membership?.title || DEFAULT_MEMBERSHIP_SECTION.title,
    subtitle: membership?.subtitle || DEFAULT_MEMBERSHIP_SECTION.subtitle,
    hasActiveMembership: membership?.hasActiveMembership === true,
    activeMembership: membership?.activeMembership
      ? mapActiveMembership(membership.activeMembership, fallbackCurrency)
      : null,
    plans: (membership?.plans ?? []).map((plan) =>
      mapMembershipPlan(plan, fallbackCurrency)
    ),
  };
}

function mapBundleItemToAddOn(
  item: QuizBundleItem,
  index: number,
  idPrefix: string,
  fallbackCurrency = "EUR"
): AddOnProduct | null {
  const product = item.product;
  if (!product?._id && !product?.title) return null;

  const originalPrice = toNumber(
    item.pricing?.original ?? product.price?.amount,
    0
  );
  const price = toNumber(
    item.pricing?.unitPrice ??
      item.pricing?.monthly ??
      product.price?.discountedPrice ??
      product.price?.amount,
    originalPrice
  );

  return {
    id: product._id ?? `${idPrefix}-${index}`,
    name: product.title ?? "Product",
    description: resolveSupplementDescription(item) ?? "",
    price,
    originalPrice: originalPrice > price ? originalPrice : undefined,
    currency: resolveItemCurrency(item, fallbackCurrency),
    imageUrl: normalizeProductImageUrl(product.productImage),
    disabled: item.isDisabled === true,
    isAdded: item.isAdded === true,
  };
}

function mapBundleItemsToAddOns(
  items: QuizBundleItem[],
  fallbackCurrency = "EUR"
): AddOnProduct[] {
  return items
    .map((item, index) =>
      mapBundleItemToAddOn(item, index, "addon", fallbackCurrency)
    )
    .filter((item): item is AddOnProduct => item != null);
}

export function formatMembershipDiscountLine(
  membershipDiscount: NonNullable<PlanPricing["membershipDiscount"]>,
  currency: string
): OrderLineItem {
  return {
    label: membershipDiscount.label,
    value: formatMembershipDiscountValue(membershipDiscount.amount, currency),
    variant: "discount",
  };
}

export function mapPricingToOrderLines(pricing: PlanPricing): OrderLineItem[] {
  const { currency } = pricing;
  const lines: OrderLineItem[] = [
    {
      label: "Subtotal",
      value: formatMoney(pricing.productSubtotal, currency),
    },
    {
      label: "Shipping",
      value:
        pricing.shipping === 0
          ? "Free"
          : formatMoney(pricing.shipping, currency),
    },
  ];

  if (pricing.membershipDiscount) {
    lines.push(formatMembershipDiscountLine(pricing.membershipDiscount, currency));
  }

  lines.push({
    label: "Sales Tax",
    value:
      pricing.tax === 0
        ? "Calc. at checkout"
        : formatMoney(pricing.tax, currency),
  });

  lines.push({
    label: "Total",
    value: formatMoney(pricing.total, currency),
    variant: "total",
  });

  return lines;
}

export function mapQuizCompleteToRecommendations(
  data?: QuizCompleteData | null
): RecommendationsPageData | null {
  const essentialBundle = data?.essentialBundle ?? [];
  const advancedBundle = data?.advancedBundle ?? [];

  if (!essentialBundle.length && !advancedBundle.length) {
    return null;
  }

  const responseCurrency = resolveRecommendationCurrency(data);

  const essentialCurrency =
    resolveCurrencyCode(data?.pricing?.essential?.currency) ||
    resolveCurrencyFromBundle(essentialBundle) ||
    responseCurrency;
  const advancedCurrency =
    resolveCurrencyCode(data?.pricing?.advanced?.currency) ||
    resolveCurrencyFromBundle(advancedBundle) ||
    responseCurrency;

  const essentialSupplements = mapBundleToSupplements(
    essentialBundle,
    essentialCurrency
  );
  const advancedSupplements = mapBundleToSupplements(
    advancedBundle,
    advancedCurrency
  );

  const essentialPricing = mapPlanPricing(
    data?.pricing?.essential,
    essentialSupplements.reduce((sum, item) => sum + item.currentPrice, 0),
    essentialCurrency
  );
  const advancedPricing = mapPlanPricing(
    data?.pricing?.advanced,
    advancedSupplements.reduce((sum, item) => sum + item.currentPrice, 0),
    advancedCurrency
  );

  return {
    userName: data?.user?.firstName || readStoredUserName(),
    sessionId: data?.sessionId,
    recommendationId: data?.recommendationId ?? data?._id,
    severityLevel: data?.severityLevel,
    defaultTier: getDefaultTierFromSeverity(data?.severityLevel),
    essentialSupplements,
    advancedSupplements,
    essentialPlan: buildPlanSummary(
      essentialBundle,
      data?.pricing?.essential,
      essentialCurrency
    ),
    advancedPlan: buildPlanSummary(
      advancedBundle,
      data?.pricing?.advanced,
      advancedCurrency
    ),
    noticeMessage: buildNoticeMessage(essentialBundle, advancedBundle),
    essentialPricing,
    advancedPricing,
    membership: mapMembershipSection(data?.membership, responseCurrency),
    addOnProducts: mapBundleItemsToAddOns(
      data?.addonProducts ?? [],
      responseCurrency
    ),
    hasApiData: true,
  };
}

export function getOrderLinesForTier(
  pageData: RecommendationsPageData,
  tier: "essential" | "advanced"
): OrderLineItem[] {
  const pricing =
    tier === "essential" ? pageData.essentialPricing : pageData.advancedPricing;

  return mapPricingToOrderLines(pricing);
}

export function getMonthlyPriceForTier(
  pageData: RecommendationsPageData,
  tier: "essential" | "advanced"
): number {
  const pricing =
    tier === "essential" ? pageData.essentialPricing : pageData.advancedPricing;

  return pricing.total;
}
