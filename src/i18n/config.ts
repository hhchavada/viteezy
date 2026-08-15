export type Locale = (typeof locales)[number];

/** Supported locales: EN, NL, DE, FR, ES only (matches general-settings) */
export const locales = ["en", "nl", "de", "fr", "es"] as const;
export const defaultLocale: Locale = "en";
