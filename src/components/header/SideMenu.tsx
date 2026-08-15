"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { X } from "../icons";
import Backdrop from "../ui/backdrop";
import { useCartSidebar } from "@/lib/cartSidebar";
import { useGetPopularBlogsQuery } from "@/store/api/blogApi";
import SideMenuBlogSlider from "./SideMenuBlogSlider";
import { useLogout } from "@/hooks/useLogout";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useLocale } from "next-intl";
import { languages as fallbackLanguages } from "../constants/countries";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";
import { useUpdateUserLanguageMutation } from "@/store/api/userApi";
import { useGetCategoriesWithProductsQuery } from "@/store/api/productApi";
import LanguageFlagIcon from "@/components/ui/LanguageFlagIcon";
import { useTranslations } from "next-intl";
import { Spinner } from "../ui";

const ACCORDION_DURATION = 1000;

const SideMenu = ({ isOpen, onClose, navigationItems = [] }: any) => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [closingItem, setClosingItem] = useState<string | null>(null);
  const [isLanguageLoading, setIsLanguageLoading] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { openCart } = useCartSidebar();
  const { data: blogData } = useGetPopularBlogsQuery();
  const blogs = blogData?.data?.blogs ?? [];

  const { logout, isLoggingOut } = useLogout();
  const { language, changeLanguage } = useLanguageSwitcher(onClose);
  const tHeader = useTranslations("Header");
  const t = useTranslations("Common");
  const tAccount = useTranslations("Account");
  const [updateUserLanguage] = useUpdateUserLanguageMutation();

  const locale = useLocale();
  const { enabledLanguages } = useGeneralSettings(locale);

  const languages = useMemo(
    () => (enabledLanguages.length > 0 ? enabledLanguages : fallbackLanguages),
    [enabledLanguages]
  );

  /** Re-render on in-app language change event */
  const [, forceUpdate] = useState({});
  useEffect(() => {
    const checkAuth = () => {
      setIsLoggedIn(Boolean(localStorage.getItem("accessToken")));
    };

    checkAuth();

    const handleStorageChange = () => {
      checkAuth();
      forceUpdate({});
    };
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("app-language-changed", handleLanguageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("app-language-changed", handleLanguageChange);
    };
  }, []);

  /** Use active locale as source of truth for display */
  const currentLanguage = useMemo(() => {
    return (
      languages.find((lang) => lang.code === locale) ||
      languages.find((lang) => lang.code === language) ||
      languages[0]
    );
  }, [language, locale, languages]);

  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetCategoriesWithProductsQuery({ lang: locale }, { skip: !isOpen });

  const dynamicCategories = useMemo(() => {
    return (
      categoriesData?.data?.categories
        ?.filter((cat: any) => cat.products && cat.products.length > 0)
        ?.sort((a: any, b: any) => b.products.length - a.products.length)
        ?.slice(0, 5)
        ?.map((cat: any) => ({
          title: cat.name,
          slug: cat.slug,
        })) ?? []
    );
  }, [categoriesData]);

  const defaultMenuItems = [
    { label: t("quiz"), href: "/quiz", badge: t("BadgeNew") },
    { label: t("consult"), href: "/consult" },
    { label: t("ShopAll"), href: "/shop" },
    { label: t("membership"), href: "/membership" },
    { label: "Learn", href: "/learn" },
    { label: t("charity"), href: "/coming-soon" },
  ];

  const mainMenuItems =
    navigationItems.length > 0 ? navigationItems : defaultMenuItems;

  const bottomMenuItems = [
    { label: t("cart"), href: "/cart", isCartAction: true },
    ...(isLoggedIn
      ? [
          { label: t("account"), href: "/account" },
          { label: tAccount("subscriptions"), href: "/settings?tab=subscribe" },
          { label: t("membership"), href: "/settings?tab=membership" },
          { label: tHeader("Settings"), href: "/settings?tab=change-password" },
          { label: t("contactUs"), href: "/contactUs" },
          { label: "logOut", isLogout: true },
        ]
      : [
          { label: tHeader("LogIn"), href: "/login" },
          { label: t("contactUs"), href: "/contactUs" },
        ]),
  ];

  const handleAccordion = (label: string) => {
    if (openAccordion === label) {
      setClosingItem(label);
      setOpenAccordion(null);

      setTimeout(() => {
        setClosingItem(null);
      }, ACCORDION_DURATION);
    } else {
      setOpenAccordion(label);
    }
  };

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  const handleLangChange = async (newLang: string) => {
    const selectedLanguage = languages.find((lang) => lang.code === newLang);

    if (selectedLanguage) {
      setIsLanguageLoading(true);
      setIsLanguageOpen(false);

      try {
        localStorage.setItem("language", selectedLanguage.name);
        localStorage.setItem("lang", selectedLanguage.code);

        try {
          await updateUserLanguage({
            language: selectedLanguage.name,
          }).unwrap();
        } catch (error) {
          console.log("Language API update:", error);
        }

        if (newLang !== locale) {
          await changeLanguage(newLang);
        }
      } catch (error) {
        console.error("Error changing language:", error);
      } finally {
        setIsLanguageLoading(false);
      }
    }
  };

  const languageDropdownRef = useClickOutside<HTMLDivElement>(() => {
    setIsLanguageOpen(false);
  });

  useEffect(() => {
    if (!isOpen) {
      setOpenAccordion(null);
      setIsLanguageOpen(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <>
      <Backdrop
        isOpen={isOpen}
        onClose={onClose}
        zIndex={40}
        transitionDuration={700}
      />

      <div
        className={`fixed h-screen overscroll-auto top-0 left-0 w-screen sm:w-110 bg-teal-500 shadow-2xl transform transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] z-50 flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-end p-6 pb-0 flex-shrink-0">
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200 cursor-pointer"
          >
            <X className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pb-3 min-h-0">
          <nav className="space-y-1 px-6">
            {mainMenuItems.map((item: any) => {
              const isShopAll =
                item.href === "/shop" || item.href === "/products";

              const shopCategories = isShopAll
                ? dynamicCategories
                : item.categories;

              const hasSubmenu = !!(
                shopCategories?.length ||
                item.subMenu?.length ||
                (isShopAll && categoriesLoading)
              );

              const isAccordionOpen = openAccordion === item.label;

              return (
                <div key={item.label} className="border-b border-white/30 pb-1">
                  {hasSubmenu ? (
                    <div className="flex items-center justify-between gap-3 py-3">
                      <button
                        type="button"
                        onClick={() => handleAccordion(item.label)}
                        className="flex min-w-0 flex-1 items-center gap-2 text-left text-lg font-medium text-white group cursor-pointer"
                      >
                        <div className="relative flex min-w-0 items-center gap-3">
                          <span className="text-3xl lg:text-4xl">
                            {item.label}
                          </span>

                          {!isAccordionOpen && closingItem !== item.label && (
                            <span className="absolute left-0 -bottom-4 h-[2px] w-full bg-white scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                          )}

                          {item.badge && (
                            <span className="bg-orange-100 text-black text-xs font-medium px-2.5 py-1 rounded-full">
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <ChevronDown
                          className={`h-6.5 w-6.5 shrink-0 text-white transition-transform duration-700 ${
                            isAccordionOpen ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isShopAll ? (
                        <Link
                          href="/products"
                          onClick={onClose}
                          className="shrink-0 rounded-full border border-white/40 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
                        >
                          {t("viewAll")}
                        </Link>
                      ) : null}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      className="w-full flex items-center text-white text-lg font-medium group py-3"
                    >
                      <span className="text-3xl lg:text-4xl relative">
                        <span className="flex items-center gap-3">
                          {item.label}
                          {"badge" in item && item.badge && (
                            <span className="bg-orange-200 text-soft-orange-color text-[12px] 3xl:text-[13px] px-2.5 py-0.25 rounded-full font-semibold leading-loose">
                              {item.badge}
                            </span>
                          )}
                        </span>
                        <span className="absolute left-0 -bottom-4 h-[2px] w-full bg-white scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                      </span>
                    </Link>
                  )}

                  {/* Accordion */}
                  {hasSubmenu && (
                    <div
                      className={`overflow-hidden transition-[max-height,opacity] duration-[700ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        isAccordionOpen
                          ? "max-h-[600px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="pb-3">
                        {shopCategories?.map((category: any) => (
                          <Link
                            key={category.slug}
                            href={`/products?categories=${encodeURIComponent(
                              category.slug
                            )}`}
                            onClick={onClose}
                            className="block text-white py-1 text-lg lg:text-xl font-medium hover:text-white/80"
                          >
                            {category.title}
                          </Link>
                        ))}

                        {item.subMenu?.map((subItem: any) => (
                          <Link
                            key={subItem.slug}
                            href={`${subItem.slug}`}
                            onClick={onClose}
                            className="block text-white py-1 text-lg lg:text-xl font-medium hover:text-white/80"
                          >
                            {subItem.title}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="px-6">
            <hr className="border-white/30" />
          </div>

          {/* Bottom */}
          <div className="mt-6 space-y-2 px-6">
            <span className="block py-1 text-lg text-white/80 font-medium">
              {tHeader("meetViteezy")}
            </span>

            {bottomMenuItems.map((item: any) => {
              if (item.isCartAction) {
                return (
                  <button
                    key={item.label}
                    onClick={() => {
                      openCart();
                      onClose();
                    }}
                    className="block w-full text-left text-white text-lg font-medium cursor-pointer hover:text-white/80"
                  >
                    {item.label}
                  </button>
                );
              }

              if (item.isLogout) {
                return (
                  <button
                    key={item.label}
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="block w-full text-left text-white text-lg font-medium cursor-pointer hover:text-white/80"
                  >
                    {isLoggingOut ? t("logoutLoading") : t("logOut")}
                  </button>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={onClose}
                  className={`block text-white text-lg font-medium ${
                    item.href === "/account" ? "xl:hidden" : ""
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <SideMenuBlogSlider blogs={blogs} onClose={onClose} />
        </div>

        {/* Language */}
        <div className="border-t border-teal-400/30 flex-shrink-0 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
          <label className="mb-3 block text-lg font-medium text-white/80">
            {t("language")}
          </label>

          <div ref={languageDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsLanguageOpen((open) => !open)}
              disabled={isLanguageLoading}
              aria-expanded={isLanguageOpen}
              aria-haspopup="listbox"
              className={`flex w-full items-center gap-3 rounded-lg bg-white py-3 pr-12 pl-3 text-left ${
                isLanguageLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"
              }`}
            >
              <LanguageFlagIcon langCode={currentLanguage.code} size={24} />
              <span className="font-medium text-gray-900">
                {currentLanguage.label}
              </span>
            </button>

            <span className="pointer-events-none absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-2 text-gray-600">
              {isLanguageLoading ? <Spinner size="xs" /> : null}
              <ChevronDown
                className={`h-6 w-6 transition-transform duration-200 ${
                  isLanguageOpen ? "rotate-180" : ""
                }`}
              />
            </span>

            {isLanguageOpen ? (
              <div
                role="listbox"
                aria-label={t("language")}
                className="absolute right-0 bottom-full left-0 z-50 mb-2 max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 shadow-lg"
              >
                {languages.map((lang: any) => {
                  const isSelected = lang.code === currentLanguage.code;

                  return (
                    <button
                      key={lang.code}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => void handleLangChange(lang.code)}
                      className={`flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors hover:bg-gray-100 ${
                        isSelected
                          ? "bg-gray-50 font-semibold text-gray-900"
                          : "text-gray-700"
                      }`}
                    >
                      <LanguageFlagIcon langCode={lang.code} size={20} />
                      <span>{lang.label}</span>
                    </button>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default React.memo(SideMenu);
