"use client";

import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatIngredientDriDisplay,
  resolveLocalizedValue,
} from "@/lib/utils";

interface ProductIngredientsSectionProps {
  productData?: any;
}

function getImageUrl(image: unknown): string | null {
  if (!image) return null;
  if (typeof image === "string") return image;
  if (typeof image === "object" && image !== null && "url" in image) {
    const url = (image as { url?: string }).url;
    return url || null;
  }
  return null;
}

function hasLocalizedContent(value: unknown, locale: string): boolean {
  return resolveLocalizedValue(value, locale).trim().length > 0;
}

export default function ProductIngredientsSection({
  productData,
}: ProductIngredientsSectionProps) {
  const t = useTranslations("Products");
  const locale = useLocale();
  const ingredientMeta = productData?.ingredientMeta;

  const ingredientRows = useMemo(() => {
    if (!productData?.ingredientCompositions?.length) return [];
    return productData.ingredientCompositions.map((ingComp: any) => ({
      id: ingComp._id,
      name:
        resolveLocalizedValue(ingComp.ingredient?.name, locale) ||
        t("unknownIngredient"),
      quantity: ingComp.quantity ?? "",
      dri: formatIngredientDriDisplay(ingComp.driPercentage) ?? "**",
    }));
  }, [productData, locale, t]);

  const title = useMemo(
    () =>
      resolveLocalizedValue(ingredientMeta?.sectionTitle, locale) ||
      resolveLocalizedValue(productData?.title, locale),
    [ingredientMeta?.sectionTitle, productData?.title, locale]
  );

  const description = useMemo(
    () =>
      resolveLocalizedValue(ingredientMeta?.sectionSubtitle, locale) ||
      resolveLocalizedValue(productData?.shortDescription, locale),
    [ingredientMeta?.sectionSubtitle, productData?.shortDescription, locale]
  );

  const excipients = useMemo(
    () => resolveLocalizedValue(ingredientMeta?.excipients, locale),
    [ingredientMeta?.excipients, locale]
  );

  const hasMeta = Boolean(
    ingredientMeta &&
      (hasLocalizedContent(ingredientMeta.sectionTitle, locale) ||
        hasLocalizedContent(ingredientMeta.sectionSubtitle, locale) ||
        getImageUrl(ingredientMeta.backgroundImage) ||
        hasLocalizedContent(ingredientMeta.excipients, locale))
  );

  if (ingredientRows.length === 0 && !hasMeta) return null;

  const backgroundImage =
    getImageUrl(ingredientMeta?.backgroundImage) ||
    getImageUrl(productData?.specification?.bg_image) ||
    productData?.specification?.bg_image ||
    "/products/ingredients-section-bg.png";

  const showTable = ingredientRows.length > 0 || excipients;
  const showFooter = ingredientRows.length > 0 || excipients;

  return (
    <section
      className="mx-2 my-6 sm:my-10 md:my-16 rounded-[20px] overflow-hidden relative"
      aria-labelledby="product-ingredients-heading"
    >
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className="absolute inset-0 bg-black/30" />

      <div className="relative z-10 w-section py-6 sm:py-10 md:py-12 lg:py-[50px]">
        <div className="flex flex-col lg:flex-row items-center lg:items-stretch gap-6 sm:gap-10 lg:gap-16 xl:gap-20">
          {/* Left: heading + description */}
          <div className="flex flex-col gap-4 sm:gap-8 lg:gap-[70px] w-full lg:max-w-[560px] shrink-0">
            <p className="text-white text-xs sm:text-[15px] 3xl:text-[19px] font-medium uppercase tracking-[0.04em]">
              {t("ingredients")}
            </p>
            <div className="flex flex-col gap-3 sm:gap-5">
              {title && (
                <h2
                  id="product-ingredients-heading"
                  className="text-white text-2xl sm:text-3xl md:text-4xl 3xl:text-[42px] font-medium leading-tight 3xl:leading-[44px]"
                >
                  {title}
                </h2>
              )}
              {description && (
                <p className="text-white text-sm sm:text-base 3xl:text-[19px] leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right: ingredients table */}
          {showTable && (
            <div className="w-full flex-1 rounded-[20px] sm:rounded-[30px] border border-white/15 bg-white/10 backdrop-blur-[44px] overflow-hidden">
              {ingredientRows.length > 0 && (
                <>
                  <div className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 md:px-10 py-3 sm:py-5 md:py-[26px] bg-white/5 border-b border-white/15 min-h-0 sm:min-h-[70px]">
                    <span className="text-white text-xs sm:text-base 3xl:text-xl flex-1 min-w-0">
                      {t("activeIngredients")}
                    </span>
                    <span className="text-white text-xs sm:text-base 3xl:text-xl text-right w-14 sm:w-20 md:w-[100px] shrink-0">
                      {t("quantity")}
                    </span>
                    <span className="text-white text-xs sm:text-base 3xl:text-xl text-right w-14 sm:w-20 md:w-[100px] shrink-0">
                      {t("driPercentage")}
                    </span>
                  </div>

                  <div className="flex flex-col">
                    {ingredientRows.map((row: any, index: number) => (
                      <div
                        key={row.id || index}
                        className="flex items-center justify-between gap-2 sm:gap-4 px-3 sm:px-5 md:px-10 py-2.5 sm:py-4 md:py-[19px] border-b border-white/15"
                      >
                        <span className="text-white text-xs sm:text-base 3xl:text-xl leading-snug flex-1 min-w-0">
                          {row.name}
                        </span>
                        <span className="text-white text-xs sm:text-base 3xl:text-xl text-right w-14 sm:w-20 md:w-[100px] shrink-0">
                          {row.quantity}
                        </span>
                        <span className="text-white text-xs sm:text-base 3xl:text-xl text-right w-14 sm:w-20 md:w-[100px] shrink-0">
                          {row.dri}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {showFooter && (
                <div className="px-3 sm:px-5 md:px-10 py-3 sm:py-4 md:py-[19px] space-y-1">
                  {ingredientRows.length > 0 && (
                    <>
                      <p className="text-white text-[11px] sm:text-sm 3xl:text-lg leading-snug">
                        {t("driDisclaimer")}
                      </p>
                      <p className="text-white text-[11px] sm:text-sm 3xl:text-lg leading-snug">
                        {t("noDriDisclaimer")}
                      </p>
                    </>
                  )}
                  {excipients && (
                    <p className="text-white text-[11px] sm:text-sm 3xl:text-lg leading-snug">
                      <span>{t("excipientsLabel")}: </span>
                      {excipients}
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
