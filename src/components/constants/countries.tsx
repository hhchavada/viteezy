import { CountryCode } from "libphonenumber-js";

export interface Language {
  code: string;
  label: string;
  name: string;
  flag: string;
}

/** Default languages (matches general-settings API: EN, NL, DE, FR, ES only) */
export const languages = [
  { code: "en", label: "EN", name: "English", flag: "🇺🇸" },
  { code: "nl", label: "NL", name: "Dutch", flag: "🇳🇱" },
  { code: "de", label: "DE", name: "German", flag: "🇩🇪" },
  { code: "fr", label: "FR", name: "French", flag: "🇫🇷" },
  { code: "es", label: "ES", name: "Spanish", flag: "🇪🇸" },
];

export const countries = [
  { code: "in", label: "INDIA", flag: "🇮🇳" },
  { code: "usa", label: "USA", flag: "🇺🇸" },
  { code: "canda", label: "CANADA", flag: "🇨🇦" },
];

export const DEFAULT_SUPPORTED_COUNTRIES: CountryCode[] = [
  "NL",
  "GB",
  "DE",
  "FR",
  "IT",
  "ES",
  "BE",
  "CH",
  "SE",
  "NO",
  "DK",
  "FI",
  "IE",
  "AT",
  "PL",
  "PT",
  "CZ",
  "HU",
  "RO",
  "US",
  "CA",
  "MX",
  "IN",
  "CN",
  "JP",
  "KR",
  "SG",
  "MY",
  "TH",
  "ID",
  "PH",
  "VN",
  "AE",
  "SA",
  "IL",
  "AU",
  "NZ",
  "ZA",
  "NG",
  "KE",
  "EG",
  "BR",
  "AR",
  "CL",
  "CO",
  "PE",
];
