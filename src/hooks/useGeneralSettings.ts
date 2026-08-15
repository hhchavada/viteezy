import { useMemo } from "react";
import { useLandingHeavyQueryGate } from "@/contexts/LandingHeavyQueryGate";
import { useGetGeneralSettingsQuery } from "@/store/api/generalSettingsApi";
import {
  getEnabledLanguagesFromSettings,
  getSocialLinksFromSettings,
  type SocialLinkItem,
} from "@/lib/generalSettings";
import type { Language } from "@/components/constants/countries";
import type { GeneralSettingsData } from "@/store/api/types/generalSettings.types";

export interface UseGeneralSettingsResult {
  data: GeneralSettingsData | undefined;
  isLoading: boolean;
  isError: boolean;
  /** Languages enabled in general settings (for selector). Empty until loaded. */
  enabledLanguages: Language[];
  /** Social links with non-empty href only. Empty until loaded. */
  socialLinks: SocialLinkItem[];
}

/**
 * Fetches general settings by locale and exposes settings, enabled languages, and social links.
 * Uses RTK Query cache – same request is shared across all consumers.
 */
export function useGeneralSettings(lang: string): UseGeneralSettingsResult {
  const { allowHeavyQueries } = useLandingHeavyQueryGate();
  const { data: response, isLoading, isError } = useGetGeneralSettingsQuery(
    { lang: lang.toLowerCase() },
    { skip: !lang || !allowHeavyQueries }
  );

  const settings = response?.data?.settings;

  const enabledLanguages = useMemo(
    () => getEnabledLanguagesFromSettings(settings),
    [settings]
  );

  const socialLinks = useMemo(
    () => getSocialLinksFromSettings(settings),
    [settings]
  );

  return {
    data: settings,
    isLoading,
    isError,
    enabledLanguages,
    socialLinks,
  };
}
