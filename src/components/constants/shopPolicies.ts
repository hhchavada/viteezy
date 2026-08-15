import { useTranslations } from "next-intl";

// Translation keys for static pages
const STATIC_PAGE_KEYS = [
  "shopsTermsAndConditions",
  "shopsTermsAndServices", 
  "refundPolicy",
  "refund",
  "cancellation",
  "cancellationPolicy",
  "termsAndServices",
  "termsOfService",
  "termsOfServices",
  "shippingPolicy",
  "shipping",
  "deliveryPolicy",
  "delivery",
  "returnPolicy",
] as const;

// Hook to get translated keywords
export const useTranslatedStaticPageKeywords = () => {
  const t = useTranslations("StaticPages");
  
  return STATIC_PAGE_KEYS.map(key => t(key));
};

// Hook to get translated shop-related keywords
export const useTranslatedShopKeywords = () => {
  const t = useTranslations("StaticPages");
  
  return STATIC_PAGE_KEYS.map(key => t(key));
};

// Hook to get translated checkout policy keywords (includes privacy)
export const useTranslatedCheckoutKeywords = () => {
  const t = useTranslations("StaticPages");
  
  return [
    ...STATIC_PAGE_KEYS.map(key => t(key)),
    t("privacyPolicy"),
    t("privacy")
  ];
};

// Legacy exports for backward compatibility
export const SHOP_RELATED_KEYWORDS = STATIC_PAGE_KEYS as readonly string[];

// Keywords for checkout-specific policies (includes privacy policy)
export const CHECKOUT_POLICY_KEYWORDS = [
  ...STATIC_PAGE_KEYS,
  "privacyPolicy",
  "privacy",
] as const;
