"use client";
import { useState, useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  formatIngredientDriDisplay,
  resolveLocalizedValue,
  sanitizeHtml,
} from "@/lib/utils";

interface ProductAccordionProps {
  productData?: any;
}

export default function ProductAccordion({
  productData,
}: ProductAccordionProps) {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const locale = useLocale();
  const t = useTranslations("Products");

  // Create static accordion items with dynamic content from API
  const accordionItems = useMemo(() => {
    const items = [];

    // Description
    if (productData?.description) {
      items.push({
        id: "description",
        title: t("description"),
        content: sanitizeHtml(
          resolveLocalizedValue(productData.description, locale),
        ),
        isHtml: true,
      });
    }

    // Ingredients
    if (productData?.ingredientCompositions && productData.ingredientCompositions.length > 0) {
      const ingredientsContent = productData.ingredientCompositions
        .map((ingComp: any, index: number) => {
          const ingredient = ingComp.ingredient;
          const ingredientName =
            resolveLocalizedValue(ingredient?.name, locale) ||
            "Unknown Ingredient";
          const ingredientDescription = resolveLocalizedValue(
            ingredient?.description,
            locale,
          );
          const driDisplay = formatIngredientDriDisplay(ingComp.driPercentage);
          const borderStyle = index < productData.ingredientCompositions.length - 1 
            ? 'border-b border-gray-200 pb-3 mb-3' 
            : '';
          
          return `
            <div class="${borderStyle}">
              <div class="font-semibold text-base mb-2">${index + 1}. ${ingredientName}</div>
              <div class="text-sm text-gray-600 mb-2">${ingredientDescription}</div>
              <div class="text-sm">
                <span class="font-medium">Quantity:</span> ${ingComp.quantity || 0} 
                ${driDisplay != null ? `| <span class="font-medium">DRI:</span> ${driDisplay}` : ''}
              </div>
            </div>
          `;
        })
        .join("");
      items.push({
        id: "ingredients",
        title: t("ingredients"),
        content: ingredientsContent,
        isHtml: true,
      });
    }

    // Nutrition Info
    if (productData?.nutritionInfo) {
      items.push({
        id: "nutritionInfo",
        title: t("nutritionInfo"),
        content: resolveLocalizedValue(productData.nutritionInfo, locale),
        isHtml: true,
      });
    }

    // How to Use
    if (productData?.howToUse) {
      items.push({
        id: "howToUse",
        title: t("howToUse"),
        content: resolveLocalizedValue(productData.howToUse, locale),
        isHtml: true,
      });
    }

    // Warnings & Precautions (static)
    items.push({
      id: "warningsPrecautions",
      title: t("warningsPrecautions"),
      content: t("warningsPrecautionsContent"),
      isHtml: false,
    });

    return items;
  }, [productData, locale, t]);

  return (
    <div className="border-t border-linen-color">
      {accordionItems.map((item) => {
        const isOpen = openAccordion === item.id;

        return (
          <div
            key={item.id}
            className="border-b border-linen-color cursor-pointer"
          >
            <button
              onClick={() => setOpenAccordion(isOpen ? null : item.id)}
              className="w-full flex items-center justify-between py-4 cursor-pointer text-left transition-colors"
            >
              <span className="text-charcol-color font-medium 3xl:text-[19px]">
                {item.title}
              </span>

              {/* + → - SVG  */}
              <svg
                className={`w-5 3xl:w-7.25 h-5 3xl:h-7.25 text-charcol-color transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                  }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  // Minus icon
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M5 12h14"
                  />
                ) : (
                  // Plus icon
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 5v14m7-7H5"
                  />
                )}
              </svg>
            </button>

            {/* SMOOTH OPEN/CLOSE */}
            <div
              className={`transition-all duration-500 overflow-hidden ${isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
            >
              <div className="pb-4 text-charcol-color text-sm 3xl:text-base leading-relaxed">
                {item.isHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: item.content }} />
                ) : (
                  item.content
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
