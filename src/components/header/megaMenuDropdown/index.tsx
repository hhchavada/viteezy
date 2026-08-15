import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import Backdrop from "../../ui/backdrop";
import { Button } from "../../ui/button";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import SubCategory from "./SubCategory";
import { CategoryItem, SubCategoryItem } from "@/components/types/header";
import { useLocale, useTranslations } from "next-intl";
import { useLazyGetCategoriesWithProductsQuery } from "@/store";
import Spinner from "@/components/ui/spinner";
import {
  CategoryProduct,
  CategoryWithProducts,
} from "@/store/api/types/product.types";

interface MegaMenuDropdownProps {
  isShow: boolean;
  onClose: () => void;
  panelRef?: React.RefObject<HTMLDivElement | null>;
  onPanelMouseEnter?: () => void;
  onPanelMouseLeave?: () => void;
}

const MegaMenuDropdown: React.FC<MegaMenuDropdownProps> = ({
  isShow,
  onClose,
  panelRef,
  onPanelMouseEnter,
  onPanelMouseLeave,
}) => {
  const locale = useLocale(); // "fr", "en", etc.
  const t = useTranslations("Header");

  const [trigger, { data, isFetching, isLoading, isError }] =
    useLazyGetCategoriesWithProductsQuery();

  // fetch ONLY when menu opens
  useEffect(() => {
    if (isShow) {
      trigger({ lang: locale }, true); // or lang: "fr"
    }
  }, [isShow, trigger, locale]);

  // transform API -> CategoryItem[]
  const categories: CategoryWithProducts[] = useMemo(() => {
    const apiCats = data?.data?.categories || [];

    // Filter categories with products, sort by product count (descending), and limit to 5
    return apiCats
      .filter((category) => category.products && category.products.length > 0)
      .sort((a, b) => b.products!.length - a.products!.length)
      .slice(0, 5);
  }, [data]);

  const [subCategory, setSubCategory] = useState<CategoryProduct[]>([]);
  const [activeCategoryTitle, setActiveCategoryTitle] = useState<string | null>(
    null
  );
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const handleCategoryHover = (
    categoryTitle: string,
    children: CategoryProduct[]
  ) => {
    if (activeCategoryTitle === categoryTitle) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);

    setIsTransitioning(true);

    timeoutRef.current = setTimeout(() => {
      setSubCategory(children);
      setActiveCategoryTitle(categoryTitle);

      animationFrameRef.current = requestAnimationFrame(() => {
        timeoutRef.current = setTimeout(() => {
          setIsTransitioning(false);
        }, 10);
      });
    }, 100);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // set first category automatically when categories loaded
  useEffect(() => {
    if (!isShow) return;
    if (!categories?.length) return;
    if (activeCategoryTitle) return;

    const first = categories[0];

    setActiveCategoryTitle(first.name);
    setSubCategory(first.products || []);
  }, [isShow, categories]);

  const showLoader = isLoading || isFetching;
  console.log(categories);

  const height = "min-h-[36vw]  xl:min-h-112 2xl:min-h-120";

  return (
    <>
      <div
        ref={panelRef}
        onMouseEnter={onPanelMouseEnter}
        onMouseLeave={onPanelMouseLeave}
        className={`${height}
          absolute left-0 right-0 top-full bg-white -z-10
          overflow-hidden transition-all duration-700 ease-in-out origin-top border-t border-slate-border-color
          ${isShow ? "translate-y-0" : "-translate-y-full"}
        `}
      >
        {showLoader ? (
          <div className={`${height} flex items-center justify-center px-2`}>
            <Spinner />
          </div>
        ) : isError ? (
          <div
            className={`${height} text-red-400 text-lg flex items-center justify-center px-2`}
          >
            Failed to load categories
          </div>
        ) : !categories?.length ? (
          <div
            className={`${height} text-lg flex items-center justify-center px-2`}
          >
            Categories not available!
          </div>
        ) : (
          <div className={`${height} w-full relative`}>
            <div className="relative z-10 flex min-h-full! max-w-[1320px] 3xl:max-w-[1580px] mx-auto px-4 sm:px-6 lg:px-8 ">
              {/* LEFT */}
              <div className={`${height} w-[30%] relative py-11 flex`}>
                <div className="absolute h-full w-screen bg-teal-500 top-0 end-0 -z-10" />

                <div className="h-full pe-14 flex flex-col justify-between w-full">
                  <div className="max-w-fit">
                    <ul className="space-y-3">
                      {categories?.slice(0, 4)?.map((item, index) => {
                        const title = item.name;
                        const slug = item.slug;

                        return (
                          <li key={index}>
                            <Link
                              href={`/products?categories=${slug}` || "#"}
                              onMouseEnter={() =>
                                handleCategoryHover(title, item.products || [])
                              }
                              onClick={onClose}
                              className="text-white font-medium text-xl xl:text-2xl 2xl:text-3xl 
                            flex items-center gap-2 
                            group transition-all duration-300 
                            w-full text-left hover:opacity-90"
                            >
                              <span className="flex-1 min-w-0 line-clamp-2 break-words overflow-hidden [overflow-wrap:anywhere]">
                                {title}
                              </span>
                              <span className="w-7 shrink-0 overflow-hidden mt-1">
                                <ChevronRight
                                  size={28}
                                  className={`
          -translate-x-full
          transition-transform duration-300
          group-hover:translate-x-0
          ${activeCategoryTitle === title ? "translate-x-0" : ""}
        `}
                                />
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  <Link
                    href="/products"
                    className="w-full mt-6"
                    onClick={onClose}
                  >
                    <Button
                      variant="elevate"
                      size="elevate"
                      animateText
                      className="w-full"
                    >
                      {t("ShopAll")}
                    </Button>
                  </Link>
                </div>
              </div>

              {/* RIGHT */}
              <div className="w-[70%] ps-14 py-11 ">
                {!subCategory?.length ? (
                  <div className="w-full flex items-center justify-center">
                    <span>{t("productNotFound")}</span>
                  </div>
                ) : (
                  <div
                    className={`grid grid-cols-1  md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-300 ease-in-out ${
                      isTransitioning
                        ? "opacity-0 translate-y-2"
                        : "opacity-100 translate-y-0"
                    }`}
                    key={activeCategoryTitle || "default"}
                  >
                    {subCategory?.slice(0, 3)?.map((subCat, idx) => (
                      <div
                        key={`${activeCategoryTitle}-${idx}`}
                        className={`transition-all duration-300 ease-out ${
                          isTransitioning
                            ? "opacity-0 translate-y-4"
                            : "opacity-100 translate-y-0"
                        }`}
                        style={{
                          transitionDelay: isTransitioning
                            ? "0ms"
                            : `${idx * 50}ms`,
                        }}
                      >
                        <SubCategory data={subCat} idx={idx} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default memo(MegaMenuDropdown);
