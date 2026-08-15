import type { GeneralSettingsData, GeneralSettingsSocialMedia } from "@/store/api/types/generalSettings.types";
import type { Language } from "@/components/constants/countries";

/** Map API language code (e.g. EN) to flag emoji. Used when building Language[] from API. */
const LANGUAGE_FLAGS: Record<string, string> = {
  EN: "🇺🇸",
  NL: "🇳🇱",
  DE: "🇩🇪",
  FR: "🇫🇷",
  ES: "🇪🇸",
  HI: "🇮🇳",
};

const LANGUAGE_NAMES: Record<string, string> = {
  EN: "English",
  NL: "Dutch",
  DE: "German",
  FR: "French",
  ES: "Spanish",
  HI: "Hindi",
};

/**
 * Build Language[] from general settings (enabled only).
 * Code is normalized to lowercase to match app locale.
 */
export function getEnabledLanguagesFromSettings(settings: GeneralSettingsData | null | undefined): Language[] {
  if (!settings?.languages?.length) return [];
  return settings.languages
    .filter((l) => l.isEnabled)
    .map((l) => {
      const codeUpper = (l.code || "").toUpperCase();
      const codeLower = codeUpper.toLowerCase();
      return {
        code: codeLower,
        label: codeUpper,
        name: LANGUAGE_NAMES[codeUpper] ?? l.name ?? codeUpper,
        flag: LANGUAGE_FLAGS[codeUpper] ?? "🌐",
      };
    });
}

export interface SocialLinkItem {
  name: string;
  href: string;
}

/**
 * Build social links array from general settings. Only includes entries with non-empty href.
 */
export function getSocialLinksFromSettings(settings: GeneralSettingsData | null | undefined): SocialLinkItem[] {
  const social: GeneralSettingsSocialMedia | undefined = settings?.socialMedia;
  if (!social) return [];

  const entries: [string, string | undefined][] = [
    ["Facebook", social.facebook],
    ["Instagram", social.instagram],
    ["LinkedIn", social.linkedin],
    ["YouTube", social.youtube],
    ["TikTok", social.tiktok],
  ];

  return entries
    .filter(([, href]) => typeof href === "string" && href.trim() !== "")
    .map(([name, href]) => ({ name, href: href!.trim() }));
}
