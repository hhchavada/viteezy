"use client";

import { useLocale } from "next-intl";
import { setUserLocale } from "@/lib/services/locale";
import { useCallback } from "react";

export const useLanguageSwitcher = (onAfterChange?: () => void) => {
  const locale = useLocale();

  const changeLanguage = useCallback(async (lang: string) => {
    if (!lang || lang === locale) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await setUserLocale(lang as any);

    if (typeof window !== "undefined") {
      localStorage.setItem("lang", lang);
      window.dispatchEvent(new Event("app-language-changed"));
    }

    onAfterChange?.();
    window.location.reload();
  }, [locale, onAfterChange]);

  return {
    language: locale,
    changeLanguage,
  };
};
