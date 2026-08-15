import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const LOCALIZED_FALLBACK_LOCALES = ["en", "nl", "de", "fr", "es", "hi"] as const;

/** Resolve API fields that may be a plain string or `{ en, nl, de, ... }` locale map. */
export function resolveLocalizedValue(
  value: unknown,
  locale = "en"
): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const normalizedLocale = locale.toLowerCase();

    const direct = record[normalizedLocale] ?? record[normalizedLocale.toUpperCase()];
    if (typeof direct === "string") return direct;

    for (const key of LOCALIZED_FALLBACK_LOCALES) {
      const candidate = record[key];
      if (typeof candidate === "string" && candidate.trim()) return candidate;
    }

    for (const candidate of Object.values(record)) {
      if (typeof candidate === "string" && candidate.trim()) return candidate;
    }
  }

  return "";
}

/** Upgrade http/ws to https/wss when the page is served over HTTPS (avoids mixed-content blocks). */
export function resolveSecureSocketUrl(url?: string): string | null {
  if (!url?.trim()) return null;

  if (typeof window === "undefined") return url.trim();

  if (window.location.protocol !== "https:") return url.trim();

  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol === "http:") {
      parsed.protocol = "https:";
    } else if (parsed.protocol === "ws:") {
      parsed.protocol = "wss:";
    }
    return parsed.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

/**
 * Map language code to ISO 3166-1 alpha-2 country code for flag image.
 * flagcdn.com supports: h24 (height 24px), 24x18, w40 – 24x24 returns 404.
 */
export function getLanguageFlagCode(langCode?: string): string {
  if (!langCode) return "us";
  const code = langCode.toLowerCase();
  const map: Record<string, string> = {
    en: "us",
    nl: "nl",
    de: "de",
    fr: "fr",
    es: "es",
  };
  return map[code] ?? code;
}

/** Get flag image URL for language code (height 24px from flagcdn.com) */
export function getLanguageFlagUrl(langCode?: string): string {
  const country = getLanguageFlagCode(langCode);
  return `https://flagcdn.com/h24/${country}.png`;
}

type PriceWithCurrency = { currency?: string };

/** Resolve product currency from API response (prefers product-level price over variant prices). */
export function resolveProductCurrency(
  productData?: {
    originalPrice?: PriceWithCurrency;
    price?: PriceWithCurrency;
    memberPrice?: PriceWithCurrency;
  },
  priceObj?: PriceWithCurrency
): string {
  return (
    productData?.originalPrice?.currency ||
    productData?.price?.currency ||
    productData?.memberPrice?.currency ||
    priceObj?.currency ||
    "EUR"
  );
}

/** Get currency symbol from currency code (e.g. EUR → €, USD → $) */
export function getCurrencySymbol(currency?: string): string {
  if (!currency) return "$";
  switch (currency.toUpperCase()) {
    case "USD":
      return "$";
    case "EUR":
      return "€";
    case "GBP":
      return "£";
    case "INR":
      return "₹";
    default:
      return currency + " ";
  }
}

export type ProductPreference = "sachets" | "pouch";

export function isRemoteImageUrl(url?: string | null): boolean {
  return /^https?:\/\//i.test(url?.trim() || "");
}

/** Pick the best product image URL from API product fields. */
export function resolveProductImageUrl(product?: {
  productImage?: string | null;
  standupPouchImages?: string[] | null;
  galleryImages?: string[] | null;
} | null): string {
  const candidates = [
    product?.productImage,
    product?.standupPouchImages?.[0],
    product?.galleryImages?.[0],
  ];

  for (const candidate of candidates) {
    const trimmed = candidate?.trim();
    if (trimmed) return trimmed;
  }

  return "";
}

export type ProductVariantAvailability = {
  hasSachets: boolean;
  hasStandUpPouch: boolean;
  showPreferenceSelector: boolean;
  defaultPreference: ProductPreference;
};

function normalizeProductVariantKey(value: unknown): string {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_");
}

/** Derive selectable product variants from API `variants` array (with legacy fallback). */
export function getProductVariantAvailability(
  productData?: {
    variants?: string[];
    hasStandupPouch?: boolean;
    variant?: string;
  } | null
): ProductVariantAvailability {
  const variants = productData?.variants;

  if (Array.isArray(variants) && variants.length > 0) {
    const normalized = variants.map(normalizeProductVariantKey);
    const hasSachets = normalized.includes("sachets");
    const hasStandUpPouch =
      normalized.includes("stand_up_pouch") ||
      normalized.includes("standup_pouch");

    // Prefer sachets whenever available; pouch only when sachets are not offered.
    const defaultPreference: ProductPreference =
      hasSachets || !hasStandUpPouch ? "sachets" : "pouch";

    return {
      hasSachets,
      hasStandUpPouch,
      showPreferenceSelector: hasSachets || hasStandUpPouch,
      defaultPreference,
    };
  }

  const hasStandUpPouch = Boolean(productData?.hasStandupPouch);

  return {
    hasSachets: true,
    hasStandUpPouch,
    showPreferenceSelector: true,
    // Default add-to-cart preference is always sachets when both exist.
    defaultPreference: "sachets",
  };
}

export type CartVariantType = "SACHETS" | "STAND_UP_POUCH";

export type AddCartItemProductData = {
  variants?: string[];
  hasStandupPouch?: boolean;
  variant?: string;
  standupPouchPrice?: {
    count_0?: { capsuleCount?: number };
  };
};

/** Map API product data to the cart `variantType` value. Defaults to SACHETS. */
export function resolveCartVariantType(
  productData?: {
    variants?: string[];
    hasStandupPouch?: boolean;
    variant?: string;
  } | null
): CartVariantType {
  const { hasSachets, hasStandUpPouch } =
    getProductVariantAvailability(productData);

  if (hasSachets) {
    return "SACHETS";
  }
  if (hasStandUpPouch) {
    return "STAND_UP_POUCH";
  }
  return "SACHETS";
}

export function getDefaultStandUpPouchPlanDays(
  productData?: Pick<AddCartItemProductData, "standupPouchPrice">
): number {
  const capsuleCount = productData?.standupPouchPrice?.count_0?.capsuleCount;
  if (typeof capsuleCount === "number" && capsuleCount > 0) {
    return capsuleCount;
  }
  return 60;
}

type SachetPriceTier = {
  currency?: string;
  amount?: number;
  discountedPrice?: number;
  durationDays?: number;
  [key: string]: unknown;
};

const SACHET_KEY_BY_DAYS: Record<number, string> = {
  30: "thirtyDays",
  60: "sixtyDays",
  90: "ninetyDays",
  180: "oneEightyDays",
};

/** Pick sachet price tier matching a subscription plan length (30/60/90/180). */
export function resolveSachetPriceForPlanDays(
  sachetPrices?: Record<string, SachetPriceTier> | null,
  planDays?: number | null
): SachetPriceTier | null {
  if (!sachetPrices || typeof sachetPrices !== "object") return null;

  const days =
    typeof planDays === "number" && planDays > 0 ? Math.round(planDays) : null;
  if (!days) return null;

  const byDuration = Object.values(sachetPrices).find(
    (tier) => tier && Number(tier.durationDays) === days
  );
  if (byDuration) return byDuration;

  const key = SACHET_KEY_BY_DAYS[days];
  return (key && sachetPrices[key]) || null;
}

/** Display amount + currency for a subscription plan-days sachet price. */
export function resolvePlanDaysDisplayPrice(
  product: {
    sachetPrices?: Record<string, SachetPriceTier> | null;
    subscriptionPrice?: number | null;
    price?: { amount?: number; currency?: string; discountedPrice?: number };
  } | null | undefined,
  planDays?: number | null
): { amount: number; currency: string } {
  const tier = resolveSachetPriceForPlanDays(product?.sachetPrices, planDays);
  if (tier) {
    const amount =
      typeof tier.discountedPrice === "number"
        ? tier.discountedPrice
        : Number(tier.amount) || 0;
    return {
      amount: Number.isFinite(amount) ? amount : 0,
      currency:
        tier.currency || product?.price?.currency || "USD",
    };
  }

  if (typeof product?.subscriptionPrice === "number") {
    return {
      amount: product.subscriptionPrice,
      currency: product.price?.currency || "USD",
    };
  }

  const fallback =
    typeof product?.price?.discountedPrice === "number"
      ? product.price.discountedPrice
      : Number(product?.price?.amount) || 0;

  return {
    amount: Number.isFinite(fallback) ? fallback : 0,
    currency: product?.price?.currency || "USD",
  };
}

export function buildAddCartItemPayload(
  productId: string,
  productData?: AddCartItemProductData | null
) {
  const variantType = resolveCartVariantType(productData);
  const payload: {
    productId: string;
    variantType: CartVariantType;
    quantity?: number;
    isOneTime?: boolean;
    planDays?: number;
  } = { productId, variantType };

  if (variantType === "STAND_UP_POUCH") {
    payload.quantity = 1;
    payload.isOneTime = true;
    payload.planDays = getDefaultStandUpPouchPlanDays(productData ?? undefined);
  }

  return payload;
}

/** Format a numeric amount with the correct currency symbol for the code */
export function formatCurrencyAmount(
  amount: number,
  currency = "EUR"
): string {
  const symbol = getCurrencySymbol(currency);
  const formatted = amount.toFixed(2);

  if (symbol.endsWith(" ")) {
    return `${symbol}${formatted}`;
  }

  return `${symbol}${formatted}`;
}

// Helper function to determine media type
export const getMediaType = (src: string) => {
  const extension = src.split(".").pop()?.toLowerCase();
  if (extension === "mp4" || extension === "webm" || extension === "mov") {
    return "video";
  }
  if (extension === "gif") {
    return "gif";
  }
  return "image";
};

// Reusable date formatter for ISO strings or Date objects
export function formatDate(
  dateInput?: string | Date,
  locale: string = "en-US",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  }
) {
  if (!dateInput) return "";
  try {
    const date =
      typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "";
    return date.toLocaleDateString(locale, options);
  } catch {
    return "";
  }
}

export function getUserFromStorage() {
  if (typeof window === "undefined") return null;
  const userData = localStorage.getItem("user");
  return userData ? JSON.parse(userData) : null;
}

/** Email from the logged-in user stored in localStorage (set at login). */
export function getLoggedInUserEmail(): string {
  const user = getUserFromStorage();
  const email = user?.email;
  return typeof email === "string" ? email.trim() : "";
}

export function hasAuthToken(): boolean {
  if (typeof window === "undefined") return false;
  return Boolean(localStorage.getItem("accessToken"));
}

// Sanitize and format HTML content from API
export function sanitizeHtml(html: string): string {
  if (!html) return "";

  // Replace escaped newlines with actual line breaks
  let cleaned = html.replace(/\\n/g, "<br />");

  // Remove any remaining backslashes that might be escaping quotes
  cleaned = cleaned.replace(/\\/g, "");

  return cleaned;
}

export function getFirstLetter(value?: string) {
  const user = value || getUserFromStorage()?.firstName;
  if (user) {
    return user?.charAt(0).toUpperCase();
  }
  return "";
}

export function formatDuration(days: number, separator: string = " "): string {
  if (!Number.isInteger(days) || days < 0) {
    return "";
  }
  if (days === 0) {
    return `0${separator}days`;
  }
  if (days === 1) {
    return `1${separator}day`;
  }
  if (days < 30) {
    return `${days}${separator}days`;
  }
  if (days === 30) {
    return `1${separator}month`;
  }
  if (days < 365) {
    const months = Math.round(days / 30);
    const unit = months === 1 ? "month" : "months";
    return `${months}${separator}${unit}`;
  }
  const years = Math.round(days / 365);
  const unit = years === 1 ? "year" : "years";
  return `${years}${separator}${unit}`;
}

export function formatDateFn(
  dateInput?: string | Date,
  format: string = "DD MMM YYYY"
): string {
  if (!dateInput) return "";

  let date: Date;
  try {
    date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "";
  } catch {
    return "";
  }

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const pad = (num: number) => String(num).padStart(2, "0");

  const monthShort = date.toLocaleDateString("en-US", { month: "short" });
  const monthLong = date.toLocaleDateString("en-US", { month: "long" });

  const replacements: Record<string, string> = {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MMMM: monthLong,
    MMM: monthShort,
    MM: pad(month + 1),
    M: String(month + 1),
    DD: pad(day),
    D: String(day),
  };

  const sortedTokens = Object.keys(replacements).sort(
    (a, b) => b.length - a.length
  );

  let formatted = format;

  const placeholders: Record<string, string> = {};
  let markerCode = 0xe000;

  for (const token of sortedTokens) {
    const marker = String.fromCharCode(markerCode++);
    placeholders[marker] = replacements[token];

    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedToken, "g");
    formatted = formatted.replace(regex, marker);
  }

  for (const [marker, value] of Object.entries(placeholders)) {
    formatted = formatted.replace(new RegExp(marker, "g"), value);
  }

  return formatted;
}

// Enhanced date formatter with month translation support
export function formatDateWithTranslation(
  dateInput?: string | Date,
  format: string = "DD MMM YYYY",
  t?: (key: string) => string
): string {
  if (!dateInput) return "";

  let date: Date;
  try {
    date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
    if (isNaN(date.getTime())) return "";
  } catch {
    return "";
  }

  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  const pad = (num: number) => String(num).padStart(2, "0");

  // Use translation function if available, otherwise fallback to English
  const getMonthTranslation = (key: string) => {
    if (t) {
      try {
        return t(key);
      } catch {
        // Fallback to English if translation fails
      }
    }
    // Fallback to English month names
    const englishMonths: Record<string, string> = {
      january: "January", february: "February", march: "March", april: "April",
      mayLong: "May", june: "June", july: "July", august: "August",
      september: "September", october: "October", november: "November", december: "December",
      jan: "Jan", feb: "Feb", mar: "Mar", apr: "Apr", may: "May",
      jun: "Jun", jul: "Jul", aug: "Aug", sep: "Sep", oct: "Oct", nov: "Nov", dec: "Dec"
    };
    return englishMonths[key] || key;
  };

  const monthKeys = ["january", "february", "march", "april", "mayLong", "june", "july", "august", "september", "october", "november", "december"];
  const monthShortKeys = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

  const replacements: Record<string, string> = {
    YYYY: String(year),
    YY: String(year).slice(-2),
    MMMM: getMonthTranslation(monthKeys[month]),
    MMM: getMonthTranslation(monthShortKeys[month]),
    MM: pad(month + 1),
    M: String(month + 1),
    DD: pad(day),
    D: String(day),
  };

  const sortedTokens = Object.keys(replacements).sort(
    (a, b) => b.length - a.length
  );

  let formatted = format;

  const placeholders: Record<string, string> = {};
  let markerCode = 0xe000;

  for (const token of sortedTokens) {
    const marker = String.fromCharCode(markerCode++);
    placeholders[marker] = replacements[token];

    const escapedToken = token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(escapedToken, "g");
    formatted = formatted.replace(regex, marker);
  }

  for (const [marker, value] of Object.entries(placeholders)) {
    formatted = formatted.replace(new RegExp(marker, "g"), value);
  }

  return formatted;
}

/**
 * Ingredient DRI label: append `%` only for finite numbers (e.g. API numeric DRI%).
 * Non-numeric values (e.g. "trace") are returned as-is without `%`.
 */
export function formatIngredientDriDisplay(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") {
    return Number.isFinite(value) ? `${value}%` : null;
  }
  if (typeof value === "string") {
    const s = value.trim();
    return s.length > 0 ? s : null;
  }
  return null;
}
