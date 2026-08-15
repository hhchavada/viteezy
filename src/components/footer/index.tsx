"use client";

import React, { memo, useMemo, useState } from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import FooterMenu from "./FooterMenu";
import MobileFooterMenu from "./MobileFooterMenu";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { languages as fallbackLanguages } from "../constants/countries";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import InputField from "../ui/input";
import { navigationData as staticNavigationData } from "../constants/footer";
import { useGetCategoriesWithProductsQuery } from "@/store/api/productApi";
import { useGetStaticPagesQuery } from "@/store/api/staticPagesApi";
import { useTranslatedShopKeywords } from "../constants/shopPolicies";
import { useFooterSubscribeMutation } from "@/store/api/contactApi";
import { toast } from "react-hot-toast";

const SHOP_CATEGORIES_MAX = 5;

const Footer = () => {
  const t = useTranslations("Footer");
  const tCommon = useTranslations("Common");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const { language, changeLanguage } = useLanguageSwitcher();
  const translatedShopKeywords = useTranslatedShopKeywords();
  const [footerSubscribe, { isLoading: isSubscribing }] =
    useFooterSubscribeMutation();
  const {
    data: generalSettings,
    enabledLanguages,
    socialLinks,
    isLoading: generalSettingsLoading,
  } = useGeneralSettings(locale);
  const { data: categoriesData } = useGetCategoriesWithProductsQuery({
    lang: locale,
  });
  const { data: staticPagesData } = useGetStaticPagesQuery({ lang: locale });

  const languages = useMemo(
    () => (enabledLanguages.length > 0 ? enabledLanguages : fallbackLanguages),
    [enabledLanguages]
  );

  const navigationData = useMemo(() => {
    const categories = categoriesData?.data?.categories ?? [];

    // Filter categories with products, sort by product count (descending), and limit to max
    const sortedCategories = categories
      .filter((cat) => cat.products && cat.products.length > 0)
      .sort((a, b) => (b.products?.length || 0) - (a.products?.length || 0))
      .slice(0, SHOP_CATEGORIES_MAX);

    const shopLinks = [
      { label: tCommon("allProducts"), href: "/products" },
      ...sortedCategories.map((cat) => ({
        label: cat.name,
        href: `/products?categories=${encodeURIComponent(cat.slug)}`,
      })),
    ];
    const shopSection = { title: tCommon("shop"), links: shopLinks };
    const otherSections = staticNavigationData
      .filter((s) => s.title !== "shop")
      .map((section) => ({
        ...section,
        title: tCommon(section.title),
        links: section.links.map((link) => ({
          ...link,
          label: tCommon(link.label),
          badge: link.badge ? tCommon(link.badge) : undefined,
        })),
      }));
    return [shopSection, ...otherSections];
  }, [categoriesData?.data?.categories, tCommon]);

  const bottomLinks = useMemo(() => {
    const contact = { label: t("contact"), href: "/contactUs" };
    const pages = staticPagesData?.data?.pages ?? [];

    // Filter out shop-related pages using translated keywords
    const pageLinks = pages
      .filter((p) => {
        const titleLower = p.title.toLowerCase();
        return !translatedShopKeywords.some((keyword) =>
          titleLower.includes(keyword.toLowerCase())
        );
      })
      .map((p) => ({
        label: p.title,
        href: `/static-pages/${encodeURIComponent(p.slug)}`,
      }));

    return [contact, ...pageLinks];
  }, [staticPagesData?.data?.pages, t, translatedShopKeywords]);

  const handleLangChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    await changeLanguage(e.target.value || "en");
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast.error(tCommon("emailRequired"));
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      toast.error(tCommon("emailInvalid"));
      return;
    }

    try {
      const result = await footerSubscribe({ email: email.trim() }).unwrap();

      if (result.success) {
        toast.success(result.message || tCommon("subscribedSuccessfully"));
        setEmail(""); // Clear email input
      } else {
        toast.error(result.message || tCommon("subscriptionFailed"));
      }
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" &&
        error !== null &&
        "data" in error &&
        typeof (error as { data?: { message?: string } }).data?.message ===
          "string"
          ? (error as { data?: { message?: string } }).data?.message
          : null;
      toast.error(errorMessage || tCommon("subscriptionFailedTryAgain"));
    }
  };

  const date = new Date();
  const year = date.getFullYear();

  return (
    <footer className="sm:px-2.5 relative z-9">
      <div className="py-14 md:py-15 bg-teal-500 rounded-2xl xl:rounded-3xl">
        <div className="w-section mx-auto">
          <div className="grid lg:grid-cols-2 items-center gap-y-8 sm:gap-y-10 gap-x-12">
            <div data-aos="fade-right" className="order-2 lg:order-1">
              <h2 className="text-white font-bold text-[28px] sm:text-3xl lg:text-4xl md:max-w-md xl:max-w-xl leading-tight">
                {t("readyToStart")}
              </h2>
              <div className="mt-7 flex flex-col sm:flex-row gap-3 max-w-lg lg:max-w-2xl items-end sm:items-center">
                <InputField
                  floating={false}
                  name="email"
                  onChange={(e) => setEmail(e.target.value)}
                  value={email}
                  placeholder={t("enterEmail")}
                  className="rounded-full! placeholder:text-gray-500 px-7 text-base py-3 md:py-3.5"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSubscribe();
                    }
                  }}
                />
                <Button
                  variant="elevate"
                  size="elevate"
                  animateText
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="px-9 min-h-[50px] md:min-h-[54px]"
                >
                  {isSubscribing ? "Subscribing..." : t("sendEmail")}
                </Button>
              </div>
            </div>
            <div
              data-aos="fade-left"
              data-aos-delay="300"
              className="order-1 lg:order-2"
            >
              <Link href="/" className="flex items-center lg:justify-end">
                <Image
                  src={generalSettings?.logoDark || "/logos/footerLogo.webp"}
                  className={`max-w-[250px] max-h-25 lg:max-w-sm xl:max-w-2xl w-full h-full ${
                    generalSettings?.logoDark ? "" : "brightness-200"
                  }`}
                  alt="Hero Image"
                  width={600}
                  height={400}
                />
              </Link>
            </div>
          </div>
          <hr className="my-12 border-white/15 hidden md:block" />
          <FooterMenu
            navigationData={navigationData}
            langs={languages}
            langValue={language}
            onLangChange={handleLangChange}
            socialLinks={socialLinks}
            isLoadingSocial={generalSettingsLoading}
          />
          <MobileFooterMenu
            navigationData={navigationData}
            langs={languages}
            langValue={language}
            onLangChange={handleLangChange}
            socialLinks={socialLinks}
            isLoadingSocial={generalSettingsLoading}
          />
        </div>
      </div>
      <div className="py-5 w-section mx-auto flex flex-col md:flex-row gap-4 sm:gap-6 md:gap-8 justify-between items-center md:items-center">
        <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 sm:gap-x-8 gap-y-3 sm:gap-y-5">
          {bottomLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="relative text-sm sm:text-base text-gray-700 hover:text-teal-600 transition-colors duration-200 font-medium"
              // target={
              //   item.href.startsWith("/static-pages") ? "_blank" : undefined
              // }
              rel={
                item.href.startsWith("/static-pages")
                  ? "noopener noreferrer"
                  : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </div>
        <span className="text-sm sm:text-base text-center md:text-left shrink-0">
          {t("copyright", { year })}
        </span>
      </div>
    </footer>
  );
};

export default memo(Footer);
