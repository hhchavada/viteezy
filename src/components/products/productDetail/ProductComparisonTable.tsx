"use client";

import { X } from "lucide-react";
import { YesIcon } from "../../icons";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import { resolveLocalizedValue } from "@/lib/utils";

interface ComparisonFeature {
  feature: string;
  greenTeaExtract: boolean;
  other: boolean;
}

interface ProductComparisonTableProps {
  productData?: any;
}

const CheckIcon = ({ filled }: { filled: boolean }) => {
  if (filled) {
    return (
      <div className="w-4 sm:w-5 3xl:w-6 h-4 sm:h-5 3xl:h-6 rounded-full bg-teal-green-color flex items-center justify-center">
        <YesIcon />
      </div>
    );
  }

  return (
    <div className="w-4 sm:w-5 3xl:w-6 h-4 sm:h-5 3xl:h-6 rounded-full border-2 border-surface-gray-200 bg-white flex items-center justify-center">
      <X className="text-surface-gray-200 h-3 sm:h-3.5 3xl:h-4 w-3 sm:w-3.5 3xl:w-4 font-bold" />
    </div>
  );
};

export default function ProductComparisonTable({
  productData,
}: ProductComparisonTableProps) {
  const locale = useLocale();
  const t = useTranslations("Products");

  // Map API comparisonSection data to component format
  const comparisonFeatures = useMemo(() => {
    if (productData?.comparisonSection?.rows) {
      const { rows } = productData.comparisonSection;

      // Map rows to ComparisonFeature format
      return rows.map((row: any) => ({
        feature: resolveLocalizedValue(row.label, locale),
        greenTeaExtract: true, // Green tea extract column is always true
        other: row.values?.[0] ?? false, // Other column uses the first value
      }));
    }

    // Default features if no API data
    return [
      { feature: "Fast-acting", greenTeaExtract: true, other: true },
      {
        feature: "Sleep support for your body",
        greenTeaExtract: true,
        other: true,
      },
      {
        feature: "Support for the gut-brain axis",
        greenTeaExtract: true,
        other: false,
      },
      {
        feature: "Bioidentical dose of melatonin—500mcg",
        greenTeaExtract: true,
        other: false,
      },
      { feature: "No next-day haze", greenTeaExtract: true, other: false },
      {
        feature: "Less than $1.50 per serving",
        greenTeaExtract: true,
        other: true,
      },
    ];
  }, [productData, locale]);

  const productName =
    resolveLocalizedValue(productData?.title, locale) || "Green tea extract";
  const otherColumnLabel =
    resolveLocalizedValue(productData?.comparisonSection?.columns?.[0], locale) ||
    t("other");

  return (
    <div className="py-4 sm:py-6 lg:py-16">
      <div className="max-w-6xl 3xl:max-w-7xl mx-auto px-3 sm:px-4 flex flex-col lg:flex-row gap-3 sm:gap-4 lg:gap-10">
        <div className="font-medium max-w-xs text-2xl sm:text-3xl lg:text-4xl text-charcol-color shrink-0 3xl:text-[42px]">
          {productName}
        </div>
        {/* <div className="w-full overflow-x-auto hide-scrollbar"> */}
        <div className="w-full overflow-x-auto">
          <div className="bg-white rounded-2xl 3xl:rounded-[30px] overflow-hidden border border-slate-border-color min-w-[320px] sm:min-w-[500px] lg:max-w-[800px] 3xl:max-w-[1200px]">
            {/* Header */}
            <div className="grid grid-cols-8 md:grid-cols-12 items-center">
              <div className="col-span-4 md:col-span-7 p-2 sm:p-3 pl-3 sm:pl-4">
                {/* intentionaly empty - header space for features column */}
              </div>

              {/* Center column: narrow, vertically padded and pill-style like the second image */}
              <div className="col-span-2 flex items-center justify-center p-0">
                <div className="mt-3 sm:mt-4 3xl:mt-8 w-full rounded-t-xl bg-off-white-color py-3.5 sm:py-6 flex items-center justify-center">
                  <span className="text-xs sm:text-sm font-medium text-[#222] text-center leading-tight 3xl:text-base">
                    {t("viteezy")}
                  </span>
                </div>
              </div>

              <div className="col-span-2 md:col-span-3 p-2 sm:p-3 md:mt-3 3xl:mt-6 flex items-center justify-center">
                <span className="text-xs sm:text-sm font-medium text-[#222] 3xl:text-base">
                  {otherColumnLabel}
                </span>
              </div>
            </div>

            {/* Feature Rows */}
            {Array.isArray(comparisonFeatures) &&
              comparisonFeatures.map((item: any, index: number) => (
                <div
                  key={index}
                  className={`grid grid-cols-8 md:grid-cols-12 items-center ${
                    index === comparisonFeatures.length - 1
                      ? "mb-4 sm:mb-6 3xl:mb-8"
                      : ""
                  }`}
                >
                  {/* Feature name column WITH border */}
                  <div
                    className={`col-span-4 md:col-span-7 lg:p-3 3xl:p-5 lg:pl-4 3xl:pl-10 px-3 sm:px-4 flex items-center border-t border-slate-border-color ${
                      index === comparisonFeatures?.length - 1 ? "" : ""
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-medium text-[#222] leading-snug line-clamp-2 lg:line-clamp-1 3xl:text-[21px]">
                      {item?.feature}
                    </span>
                  </div>

                  {/* Green tea extract column WITHOUT border */}
                  <div className="col-span-2 flex justify-center items-center">
                    <div
                      className={`w-full bg-off-white-color py-2.5 sm:py-4 3xl:py-6.25 border-t border-off-white-color flex items-center justify-center ${
                        index === comparisonFeatures.length - 1
                          ? "rounded-b-xl"
                          : ""
                      }`}
                    >
                      <CheckIcon filled={item.greenTeaExtract} />
                    </div>
                  </div>

                  {/* Other column WITH border */}
                  <div className="col-span-2 md:col-span-3 py-2 sm:py-3 3xl:py-6.25 flex justify-center items-center border-t border-slate-border-color">
                    <CheckIcon filled={item.other} />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
