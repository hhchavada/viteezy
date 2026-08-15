"use client";

import React, { memo, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Check, ChevronDown } from "lucide-react";
import PortalDialog from "@/components/ui/portalDialog";
import FixedPortal from "@/components/ui/fixedPortal";
import { Button } from "@/components/ui/button";
import { useLocale } from "next-intl";
import { useTranslations } from "next-intl";

import {
  languages as fallbackLanguages,
} from "@/components/constants/countries";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import { getUserCountry, setUserCountry } from "@/lib/services/country";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";
import { useUpdateUserLanguageMutation } from "@/store/api/userApi";
import LanguageFlagIcon from "@/components/ui/LanguageFlagIcon";

type DropdownPosition = {
  top: number;
  left: number;
  width: number;
};

const LanguageDialog = () => {
  const locale = useLocale();
  const t = useTranslations("Common");
  const { enabledLanguages } = useGeneralSettings(locale);
  const languages = useMemo(
    () => (enabledLanguages.length > 0 ? enabledLanguages : fallbackLanguages),
    [enabledLanguages]
  );

  /** Modal state */
  const [isOpen, setIsOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<DropdownPosition | null>(
    null
  );
  const languageTriggerRef = useRef<HTMLButtonElement>(null);
  const languageMenuRef = useRef<HTMLDivElement>(null);

  /** Draft selections (applied only on Confirm) */
  const [selectedLang, setSelectedLang] = useState(locale);
  const [selectedCountry, setSelectedCountry] = useState("in");

  const { changeLanguage } = useLanguageSwitcher();
  const [updateUserLanguage] = useUpdateUserLanguageMutation();

  const updateDropdownPosition = () => {
    const trigger = languageTriggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    if (!isLanguageDropdownOpen) return;

    updateDropdownPosition();

    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedTrigger = languageTriggerRef.current?.contains(target);
      const clickedMenu = languageMenuRef.current?.contains(target);
      if (!clickedTrigger && !clickedMenu) {
        setIsLanguageDropdownOpen(false);
      }
    };

    const handleViewportChange = () => {
      updateDropdownPosition();
    };

    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isLanguageDropdownOpen]);

  /** Update selected language when localStorage changes (for cross-tab sync) */
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "lang" && e.newValue) {
        const newLang = e.newValue;
        if (languages.find(lang => lang.code === newLang)) {
          setSelectedLang(newLang);
        }
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [languages]);

  /** Load saved country */
  useEffect(() => {
    const fetchCountry = async () => {
      const country = await getUserCountry();
      setSelectedCountry(country || "in");
    };
    fetchCountry();
  }, []);

  /** Handlers */
  const handleOpen = () => {
    setSelectedLang(locale);
    setIsOpen(true);
  };
  const handleClose = () => {
    setIsLanguageDropdownOpen(false);
    setDropdownPosition(null);
    setIsOpen(false);
  };

  const handleLangChange = (langCode: string) => {
    setSelectedLang(langCode);
    setIsLanguageDropdownOpen(false);
    setDropdownPosition(null);
  };

  const onConfirm = async () => {
    try {
      // Get selected language details
      const selectedLanguage = languages.find(
        (lang) => lang.code === selectedLang
      );

      if (selectedLanguage) {
        // Store in localStorage
        localStorage.setItem("language", selectedLanguage.name);
        localStorage.setItem("lang", selectedLanguage.code);

        // Update user language in API (only send language name)
        try {
          await updateUserLanguage({
            language: selectedLanguage.name,
          }).unwrap();
          console.log("Language updated successfully");
        } catch (error) {
          // Continue even if API call fails (user might not be logged in)
          console.log("Language API update:", error);
        }

        // Update language if changed
        if (selectedLang !== locale) {
          await changeLanguage(selectedLang);
        }
      }

      // Update country
      await setUserCountry(selectedCountry);

      // Close dialog
      handleClose();
    } catch (error) {
      console.error("Error updating language:", error);
    }
  };

  /** Current language display */
  const currentLangCode = useMemo(() => {
    return locale;
  }, [locale]);

  const currentLang = useMemo(() => {
    return languages.find((lang) => lang.code === currentLangCode) ?? languages[0];
  }, [currentLangCode, languages]);

  const selectedLanguage = useMemo(() => {
    return languages.find((lang) => lang.code === selectedLang) ?? languages[0];
  }, [languages, selectedLang]);

  /** Force re-render when localStorage changes */
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const handleStorageChange = () => {
      forceUpdate({});
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  return (
    <div>
      {/* Trigger */}
      <div
        onClick={handleOpen}
        className="flex items-center gap-1.5 p-2 px-2.5 rounded-full
                   hover:bg-white transition-colors duration-300 cursor-pointer"
      >
        <LanguageFlagIcon langCode={currentLang.code} size={24} />
        <span className="text-base font-semibold text-gray-700 hidden sm:inline">
          {currentLang.label}
        </span>
      </div>

      {/* Dialog */}
      <PortalDialog
        width={800}
        isShow={isOpen}
        onClose={handleClose}
        bodyClass="p-0 overflow- bg-off-white-color p-3.5 lg:p-1.5"
        contentClass="m-0"
        closeButtonClass="m-6 md:m-2"
        transitionDuration={800}
      >
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Image */}
          <div>
            <Image
              width={400}
              height={400}
              src="/bannerImg1.png"
              alt={t("selectLanguageAndCountry")}
              // className="w-full h-75 md:h-full object-cover rounded-lg"
              className="w-full h-75 md:h-90 object-cover rounded-lg"
            />
          </div>

          {/* Content */}
          <div className="py-2 md:py-12 px-0 md:px-7.5">
            <h3 className="text-xl md:text-2xl font-medium mb-4 md:mb-8">
              {t("selectLanguageAndCountry")}
            </h3>

            {/* Language */}
            <div>
              <label className="block mb-2 font-medium text-sm md:text-base">
                {t("language")}
              </label>
              <div className="relative">
                <button
                  ref={languageTriggerRef}
                  type="button"
                  className="w-full h-12 rounded-xl border border-extra-light-gray bg-white px-4 text-left flex items-center justify-between gap-3 outline-teal-500 hover:outline-1 focus:outline-1 transition-colors"
                  aria-haspopup="listbox"
                  aria-expanded={isLanguageDropdownOpen}
                  onClick={() =>
                    setIsLanguageDropdownOpen((open) => {
                      const nextOpen = !open;
                      if (nextOpen) {
                        requestAnimationFrame(updateDropdownPosition);
                      } else {
                        setDropdownPosition(null);
                      }
                      return nextOpen;
                    })
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Escape") {
                      setIsLanguageDropdownOpen(false);
                      setDropdownPosition(null);
                    }
                  }}
                >
                  <span className="flex items-center gap-3 min-w-0">
                    <LanguageFlagIcon
                      langCode={selectedLanguage.code}
                      size={22}
                    />
                    <span className="truncate text-sm md:text-base font-medium text-gray-800">
                      {selectedLanguage.name}
                    </span>
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-gray-500 transition-transform duration-200 ${
                      isLanguageDropdownOpen ? "rotate-180" : ""
                    }`}
                    strokeWidth={2.5}
                    aria-hidden="true"
                  />
                </button>

                {isLanguageDropdownOpen && dropdownPosition && (
                  <FixedPortal>
                    <div
                      ref={languageMenuRef}
                      role="listbox"
                      className="fixed z-100 overflow-hidden rounded-xl border border-extra-light-gray bg-white shadow-xl"
                      style={{
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: dropdownPosition.width,
                      }}
                    >
                      {languages.map((lang) => {
                        const isSelected = selectedLang === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            role="option"
                            aria-selected={isSelected}
                            className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left text-sm md:text-base transition-colors ${
                              isSelected
                                ? "bg-teal-50 text-teal-700"
                                : "text-gray-700 hover:bg-off-white-color"
                            }`}
                            onClick={() => handleLangChange(lang.code)}
                          >
                            <span className="flex items-center gap-3 min-w-0">
                              <LanguageFlagIcon
                                langCode={lang.code}
                                size={22}
                              />
                              <span className="truncate font-medium">
                                {lang.name}
                              </span>
                            </span>
                            {isSelected && (
                              <Check
                                className="h-4 w-4 shrink-0 text-teal-600"
                                strokeWidth={3}
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </FixedPortal>
                )}
              </div>
            </div>

            {/* Country - Commented out */}
            {/* <div>
              <label className="block mb-2 mt-4 sm:mt-5 font-medium text-sm md:text-base">
                {t("shippingCountry")}
              </label>
              <SelectField
                className="font-medium"
                value={selectedCountry}
                onChange={handleCountryChange}
              >
                {countries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.flag} &nbsp;&nbsp; {tCountries(country.code)}
                  </option>
                ))}
              </SelectField>
            </div> */}

            {/* Confirm */}
            <Button
              className="w-full mt-4 sm:mt-6 md:mt-8 h-12"
              animateText
              size="elevate"
              variant="elevate"
              type="button"
              onClick={onConfirm}
            >
              {t("confirm")}
            </Button>
          </div>
        </div>
      </PortalDialog>
    </div>
  );
};

export default memo(LanguageDialog);
