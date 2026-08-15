"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useGetStaticPagesQuery } from "@/store/api/staticPagesApi";
import { useLocale, useTranslations } from "next-intl";
import { useTranslatedCheckoutKeywords } from "../constants/shopPolicies";

const CheckoutPolicies: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations("Checkout");
  const { data: staticPagesData } = useGetStaticPagesQuery({ lang: locale });
  const translatedCheckoutKeywords = useTranslatedCheckoutKeywords();

  const pages = staticPagesData?.data?.pages ?? [];

  const { shopPolicies, hasPrivacyPolicy, termsPage } = useMemo(() => {
    const shopPages = pages.filter((p) => {
      const titleLower = p.title.toLowerCase();
      return translatedCheckoutKeywords.some((keyword) =>
        titleLower.includes(keyword.toLowerCase())
      );
    });

    const hasPrivacy = shopPages.some((p) => {
      const titleLower = p.title.toLowerCase();
      return titleLower.includes(t("privacy").toLowerCase());
    });

    // Find terms page (could be "terms of service", "terms & conditions", etc.)
    const termsPage = shopPages.find((p) => {
      const titleLower = p.title.toLowerCase();
      return titleLower.includes(t("terms").toLowerCase()) || titleLower.includes(t("service").toLowerCase());
    });

    return {
      shopPolicies: shopPages,
      hasPrivacyPolicy: hasPrivacy,
      termsPage: termsPage,
    };
  }, [pages, translatedCheckoutKeywords]);

  // If no shop-related policies found, don't render anything
  if (shopPolicies.length === 0) {
    return (
      <div className="space-y-4 text-sm text-gray-600">
        <div className="leading-relaxed">
          {t("deferredOrRecurringPurchaseNotice")}
        </div>
      </div>
    );
  }

  // If no terms or privacy policies available, don't show first line
  if (!termsPage && !hasPrivacyPolicy) {
    return (
      <div className="space-y-4 text-sm text-gray-600">
        <div className="leading-relaxed">
          {t("deferredOrRecurringPurchaseNotice")}
        </div>

        {/* Policy links */}
        <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
          {shopPolicies.map((page) => (
            <Link
              key={page.id}
              href={`/static-pages/${encodeURIComponent(page.slug)}`}
              className="text-black underline capitalize"
              // target="_blank"
              rel="noopener noreferrer"
            >
              {page.title.toLowerCase()}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-sm text-gray-600">
      {/* Main agreement text */}
      <div className="leading-relaxed">
        {t("yourInformationWillBeSecurelyStored")} {t("shop")}{" "}
        {termsPage && (
          <>
            {termsPage ? (
              <Link
                href={`/static-pages/${encodeURIComponent(termsPage.slug)}`}
                className="text-black underline ml-1"
                // target="_blank"
                rel="noopener noreferrer"
              >
                {termsPage.title}
              </Link>
            ) : (
              <span className="text-black underline ml-1">
                {t("termsOfService")}
              </span>
            )}
            {hasPrivacyPolicy && ` ${t("andAcknowledgeOur")} `}
          </>
        )}
        {hasPrivacyPolicy && (
          <Link
            href={`/static-pages/${encodeURIComponent(
              shopPolicies.find((p) =>
                p.title.toLowerCase().includes("privacy")
              )?.slug || ""
            )}`}
            className="text-black underline ml-1"
            // target="_blank"
            rel="noopener noreferrer"
          >
            {t("privacyPolicy")}
          </Link>
        )}
        .
      </div>

      {/* Deferred/recurring purchase notice */}
      <div className="leading-relaxed">
        {t("deferredOrRecurringPurchaseNotice")}
      </div>

      {/* Policy links */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
        {shopPolicies.map((page) => (
          <Link
            // target="_blank"
            key={page.id}
            href={`/static-pages/${encodeURIComponent(page.slug)}`}
            className="text-black underline capitalize"
          >
            {page.title.toLowerCase()}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CheckoutPolicies;
