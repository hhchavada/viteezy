"use client";

import FallbackImage from "@/components/ui/fallbackImage";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  BlackStarIcon,
  DropdownDownArrow,
  HeartIcon,
  HeartIconFilled,
} from "../icons";
import { Button } from "../ui/button";
import { sortOptions } from "../constants";
import Banner from "../ui/banner";
import Pagination from "../pagination";
import FavoritePopup from "./productDetail/FavoritePopup";
import { useCartSidebar } from "@/lib/cartSidebar";
import { useWishlist } from "@/hooks";
import { hasAuthToken, getCurrencySymbol, resolveProductCurrency } from "@/lib/utils";
import { getLanguageQueryForApi } from "@/lib/services/language";
import {
  useLazyGetCategoriesQuery,
  useLazyGetProductGoalsQuery,
  useLazyGetProductsPageIngredientsQuery,
  useGetProductsQuery,
  useAddCartItemMutation,
} from "@/store";
import { useTranslations } from "next-intl";
import { toast } from "react-hot-toast";
import AOS from "aos";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const heroImageSrc = "/products/productHeroBanner.png";
const FILTER_INGREDIENTS_PAGE_SIZE = 20;

type FilterDropdownKey = "category" | "healthGoal" | "ingredient";

function FilterCheckboxDropdown({
  isOpen,
  options,
  selectedValues,
  onToggle,
  getOptionId,
  getOptionLabel,
  isLoading = false,
  isLoadingMore = false,
  isError = false,
  emptyLabel,
  onScroll,
  mobile = false,
}: {
  isOpen: boolean;
  options: any[];
  selectedValues: string[];
  onToggle: (value: string) => void;
  getOptionId: (option: any) => string;
  getOptionLabel: (option: any) => string;
  isLoading?: boolean;
  isLoadingMore?: boolean;
  isError?: boolean;
  emptyLabel?: string;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  mobile?: boolean;
}) {
  if (!isOpen) return null;

  return (
    <div
      className={`origin-top animate-in fade-in-0 slide-in-from-top-2 duration-200 ease-out ${
        mobile
          ? "w-full bg-white rounded-2xl border border-gains-light-boro shadow-sm"
          : "w-56 min-w-56 bg-white rounded-2xl 3xl:rounded-3xl shadow-lg border border-gains-light-boro"
      }`}
    >
      <div
        className="p-3 xl:p-4 3xl:p-5 space-y-2 h-full max-h-60 overflow-auto"
        onScroll={onScroll}
      >
        {isLoading ? (
          <FilterOptionSkeleton />
        ) : isError ? (
          <p className="py-4 text-center text-sm text-red-500">{emptyLabel}</p>
        ) : options.length === 0 ? (
          <p className="py-4 text-center text-sm text-gray-500">{emptyLabel}</p>
        ) : (
          <>
            {options.map((option) => {
              const optionId = getOptionId(option);
              const isChecked = selectedValues.includes(optionId);

              return (
                <label
                  key={optionId}
                  className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-0.5 rounded transition-colors"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggle(optionId)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center ${
                        isChecked
                          ? "bg-teal-green-color border-teal-green-color"
                          : "bg-white border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {isChecked && (
                        <svg
                          className="w-5 h-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">
                    {getOptionLabel(option)}
                  </span>
                </label>
              );
            })}
            {isLoadingMore ? <FilterOptionSkeleton count={3} /> : null}
          </>
        )}
      </div>
    </div>
  );
}

function FilterOptionSkeleton({ count = 5 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-2 rounded p-0.5 animate-pulse"
        >
          <div className="h-4 w-4 rounded border border-gray-200 bg-gray-200" />
          <div
            className="h-4 rounded bg-gray-200"
            style={{ width: `${55 + (index % 3) * 12}%` }}
          />
        </div>
      ))}
    </>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="bg-offwhite-color rounded-2xl overflow-hidden shadow-sm animate-pulse">
      <div className="aspect-square m-1.25 rounded-2xl bg-gray-200" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-2/3" />
        <div className="flex items-center justify-between pt-2">
          <div className="h-5 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
}

function ResultsInfoSkeleton() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-48" />
      <div className="h-5 bg-gray-200 rounded w-36" />
    </div>
  );
}

// Local component: Wishlist heart toggle for product cards
function WishlistToggle({
  productId,
  initialIsLiked = false,
  className = "",
  onToggle,
}: {
  productId: string;
  initialIsLiked?: boolean;
  className?: string;
  onToggle?: (wasLiked: boolean, nowLiked: boolean) => void;
}) {
  const tProducts = useTranslations("Products");
  const { isLoading, toggleWithId } = useWishlist(undefined, false, initialIsLiked);
  const [liked, setLiked] = useState(initialIsLiked);

  useEffect(() => {
    setLiked(initialIsLiked);
  }, [initialIsLiked]);

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const wasLiked = liked;

    try {
      setLiked((prev) => !prev);
      await toggleWithId(productId);
      onToggle?.(wasLiked, !wasLiked);
    } catch (err) {
      setLiked((prev) => !prev);
      console.error("Failed to toggle wishlist:", err);
    }
  };

  return (
    <button
      aria-label={
        liked ? tProducts("removeFromWishlist") : tProducts("addToWishlist")
      }
      onClick={handleClick}
      disabled={isLoading}
      className={`w-9 3xl:w-11 h-9 3xl:h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${className}`}
    >
      {liked ? <HeartIconFilled /> : <HeartIcon />}
    </button>
  );
}

export default function ProductsPage() {
  const t = useTranslations("Products");
  const tCommon = useTranslations("Common");
  const tCheckout = useTranslations("Checkout");
  const apiLang = getLanguageQueryForApi();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [openFilterDropdown, setOpenFilterDropdown] =
    useState<FilterDropdownKey | null>(null);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [isFavoritePopupOpen, setIsFavoritePopupOpen] = useState(false);
  const [selectedFavoriteProduct, setSelectedFavoriteProduct] =
    useState<any>(null);

  const filtersBarRef = useRef<HTMLDivElement>(null);
  const filtersScrollRef = useRef<HTMLDivElement>(null);
  const categoryFilterRef = useRef<HTMLDivElement>(null);
  const healthGoalFilterRef = useRef<HTMLDivElement>(null);
  const ingredientFilterRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  const productsTopRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ left: 0 });

  const { openCart } = useCartSidebar();

  const [
    fetchCategories,
    {
      data: categoriesData,
      isFetching: isCategoriesFetching,
      isError: isCategoriesError,
    },
  ] = useLazyGetCategoriesQuery();
  const [
    fetchGoals,
    {
      data: goalsData,
      isFetching: isGoalsFetching,
      isError: isGoalsError,
    },
  ] = useLazyGetProductGoalsQuery();
  const [
    fetchIngredients,
    {
      isFetching: isIngredientsFetching,
      isError: isIngredientsError,
    },
  ] = useLazyGetProductsPageIngredientsQuery();

  const [ingredientOptions, setIngredientOptions] = useState<any[]>([]);
  const [ingredientListPage, setIngredientListPage] = useState(1);
  const [hasMoreIngredients, setHasMoreIngredients] = useState(false);
  const [isIngredientsInitialLoading, setIsIngredientsInitialLoading] =
    useState(false);
  const [isLoadingMoreIngredients, setIsLoadingMoreIngredients] =
    useState(false);
  const isLoadingIngredientsRef = useRef(false);

  const categories = categoriesData?.data?.categories || [];
  const healthGoals = goalsData?.data?.goals || [];

  const productsPerPage = 16;

  // -------- URL as source of truth --------
  const urlState = useMemo(() => {
    const page = parseInt(searchParams.get("page") || "1", 10);
    const search = searchParams.get("search") || "";
    const sortBy = searchParams.get("sortBy") || "relevance";
    const categoriesParam = searchParams.get("categories") || "";
    const healthGoalParam = searchParams.get("healthGoal") || "";
    const ingredientsParam = searchParams.get("ingredients") || "";

    const selectedCategories = categoriesParam
      ? categoriesParam.split(", ").filter(Boolean)
      : [];
    const selectedHealthGoals = healthGoalParam
      ? healthGoalParam.split(", ").filter(Boolean)
      : [];
    const selectedIngredients = ingredientsParam
      ? ingredientsParam.split(", ").filter(Boolean)
      : [];

    return {
      page: Number.isNaN(page) ? 1 : page,
      search,
      sortBy,
      selectedCategories,
      selectedHealthGoals,
      selectedIngredients,
      hasStandupPouch: searchParams.get("hasStandupPouch") === "true",
    };
  }, [searchParams]);

  // local search input (for typing debounce)
  const [searchInput, setSearchInput] = useState(urlState.search);

  // if URL search changes (like from header SearchMenu), sync input
  useEffect(() => {
    setSearchInput(urlState.search);
  }, [urlState.search]);

  // debounce
  const [debouncedSearch, setDebouncedSearch] = useState(urlState.search);
  useEffect(() => {
    const h = setTimeout(() => setDebouncedSearch(searchInput.trim()), 400);
    return () => clearTimeout(h);
  }, [searchInput]);

  // helper to update URL params using Next router
  const updateUrl = (patch: {
    page?: number;
    search?: string;
    sortBy?: string;
    categories?: string[];
    healthGoals?: string[];
    ingredients?: string[];
    hasStandupPouch?: boolean;
  }) => {
    const params = new URLSearchParams(searchParams.toString());

    const nextCategories =
      patch.categories !== undefined
        ? patch.categories
        : urlState.selectedCategories;

    if (nextCategories.length)
      params.set("categories", nextCategories.join(", "));
    else params.delete("categories");

    const nextHealthGoals =
      patch.healthGoals !== undefined
        ? patch.healthGoals
        : urlState.selectedHealthGoals;

    if (nextHealthGoals.length)
      params.set("healthGoal", nextHealthGoals.join(", "));
    else params.delete("healthGoal");

    const nextIngredients =
      patch.ingredients !== undefined
        ? patch.ingredients
        : urlState.selectedIngredients;

    if (nextIngredients.length)
      params.set("ingredients", nextIngredients.join(", "));
    else params.delete("ingredients");

    const nextHasStandupPouch =
      patch.hasStandupPouch !== undefined
        ? patch.hasStandupPouch
        : urlState.hasStandupPouch;

    if (nextHasStandupPouch) params.set("hasStandupPouch", "true");
    else params.delete("hasStandupPouch");

    const nextSort =
      patch.sortBy !== undefined ? patch.sortBy : urlState.sortBy;
    if (nextSort && nextSort !== "relevance") params.set("sortBy", nextSort);
    else params.delete("sortBy");

    const nextSearch =
      patch.search !== undefined ? patch.search : urlState.search;
    if (nextSearch) params.set("search", nextSearch);
    else params.delete("search");

    const nextPage = patch.page !== undefined ? patch.page : urlState.page;
    if (nextPage > 1) params.set("page", String(nextPage));
    else params.delete("page");

    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  // when debouncedSearch changes -> update URL and reset page to 1
  useEffect(() => {
    if (debouncedSearch === (urlState.search || "")) return;
    updateUrl({ search: debouncedSearch, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // Fetch products (NO manual refetch needed)
  const {
    data: productsData,
    isLoading,
    isFetching,
    error,
  } = useGetProductsQuery({
    categories:
      urlState.selectedCategories.length > 0
        ? urlState.selectedCategories.join(", ")
        : undefined,
    healthGoal:
      urlState.selectedHealthGoals.length > 0
        ? urlState.selectedHealthGoals.join(", ")
        : undefined,
    ingredientIds:
      urlState.selectedIngredients.length > 0
        ? urlState.selectedIngredients.join(", ")
        : undefined,
    hasStandupPouch: urlState.hasStandupPouch,
    sortBy: urlState.sortBy !== "relevance" ? urlState.sortBy : undefined,
    search: urlState.search || undefined,
    page: urlState.page,
    limit: productsPerPage,
  });

  const products = productsData?.data || productsData || [];
  const pagination = productsData?.pagination;
  const showProductsSkeleton = isLoading || isFetching;

  const [addCartItem] = useAddCartItemMutation();

  const handleAddToCart = async (
    productId: string,
    _hasStandupPouch: boolean
  ) => {
    if (!hasAuthToken()) {
      toast.error(tCommon("loginRequired"));
      return;
    }
    try {
      const res = await addCartItem({
        productId,
        variantType: "SACHETS",
      }).unwrap();
      toast.success(res?.message || tCheckout("addedToCartSuccessfully"));
      openCart();
    } catch (error: any) {
      const message =
        error?.data?.message || error?.message || t("failedToAddToCart");
      toast.error(message);
    }
  };

  const hasActiveFilters =
    urlState.selectedCategories.length > 0 ||
    urlState.selectedHealthGoals.length > 0 ||
    urlState.selectedIngredients.length > 0 ||
    urlState.hasStandupPouch;

  const resultsLabel = useMemo(() => {
    const parts: string[] = [];

    urlState.selectedCategories.forEach((slug) => {
      const category = categories.find((item: any) => item?.slug === slug);
      if (category?.name) parts.push(category.name);
    });

    parts.push(...urlState.selectedHealthGoals);

    urlState.selectedIngredients.forEach((id) => {
      const ingredient = ingredientOptions.find((item) => item._id === id);
      if (ingredient?.name) parts.push(ingredient.name);
    });

    if (urlState.hasStandupPouch) {
      parts.push(t("standupPouches"));
    }

    if (urlState.search) {
      parts.push(`"${urlState.search}"`);
    }

    return parts.length > 0 ? parts.join(", ") : t("all");
  }, [
    categories,
    ingredientOptions,
    t,
    urlState.hasStandupPouch,
    urlState.search,
    urlState.selectedCategories,
    urlState.selectedHealthGoals,
    urlState.selectedIngredients,
  ]);

  const loadIngredients = useCallback(
    async (page: number, append: boolean) => {
      if (isLoadingIngredientsRef.current) return;
      isLoadingIngredientsRef.current = true;

      if (page === 1) {
        setIsIngredientsInitialLoading(true);
      } else {
        setIsLoadingMoreIngredients(true);
      }

      try {
        const result = await fetchIngredients(
          { page, limit: FILTER_INGREDIENTS_PAGE_SIZE },
          false
        ).unwrap();
        const items = result.data ?? [];

        setIngredientOptions((prev) => (append ? [...prev, ...items] : items));
        setHasMoreIngredients(result.pagination?.hasNext ?? false);
        setIngredientListPage(page);
      } catch {
        if (!append) {
          setIngredientOptions([]);
        }
      } finally {
        isLoadingIngredientsRef.current = false;
        setIsIngredientsInitialLoading(false);
        setIsLoadingMoreIngredients(false);
      }
    },
    [fetchIngredients]
  );

  const handleIngredientScroll = useCallback(
    (event: React.UIEvent<HTMLDivElement>) => {
      if (!hasMoreIngredients || isLoadingMoreIngredients) return;

      const target = event.currentTarget;
      const nearBottom =
        target.scrollTop + target.clientHeight >= target.scrollHeight - 24;

      if (nearBottom) {
        void loadIngredients(ingredientListPage + 1, true);
      }
    },
    [
      hasMoreIngredients,
      ingredientListPage,
      isLoadingMoreIngredients,
      loadIngredients,
    ]
  );

  const toggleFilterDropdown = (filter: FilterDropdownKey) => {
    const isClosing = openFilterDropdown === filter;

    if (isClosing) {
      setOpenFilterDropdown(null);
      setIsSortDropdownOpen(false);
      return;
    }

    setOpenFilterDropdown(filter);
    setIsSortDropdownOpen(false);

    if (filter === "category") {
      fetchCategories({ lang: apiLang }, false);
    } else if (filter === "healthGoal") {
      fetchGoals(undefined, false);
    } else if (filter === "ingredient") {
      void loadIngredients(1, false);
    }
  };

  const updateDropdownPosition = useCallback((filter: FilterDropdownKey) => {
    const targetRef =
      filter === "category"
        ? categoryFilterRef
        : filter === "healthGoal"
          ? healthGoalFilterRef
          : ingredientFilterRef;

    const target = targetRef.current;
    const container = filtersBarRef.current;
    if (!target || !container) return;

    const targetRect = target.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setDropdownPosition({
      left: targetRect.left - containerRect.left,
    });
  }, []);

  useLayoutEffect(() => {
    if (!openFilterDropdown) return;

    const reposition = () => updateDropdownPosition(openFilterDropdown);
    reposition();

    window.addEventListener("resize", reposition);
    const scrollEl = filtersScrollRef.current;
    scrollEl?.addEventListener("scroll", reposition, { passive: true });

    return () => {
      window.removeEventListener("resize", reposition);
      scrollEl?.removeEventListener("scroll", reposition);
    };
  }, [openFilterDropdown, updateDropdownPosition]);

  useEffect(() => {
    if (urlState.selectedCategories.length > 0 && !categoriesData) {
      fetchCategories({ lang: apiLang }, false);
    }
  }, [
    apiLang,
    categoriesData,
    fetchCategories,
    urlState.selectedCategories.length,
  ]);

  useEffect(() => {
    if (urlState.selectedHealthGoals.length > 0 && !goalsData) {
      fetchGoals(undefined, false);
    }
  }, [fetchGoals, goalsData, urlState.selectedHealthGoals.length]);

  useEffect(() => {
    if (
      urlState.selectedIngredients.length > 0 &&
      ingredientOptions.length === 0
    ) {
      void loadIngredients(1, false);
    }
  }, [
    ingredientOptions.length,
    loadIngredients,
    urlState.selectedIngredients.length,
  ]);

  const toggleSortDropdown = () => {
    setIsSortDropdownOpen((v) => !v);
    setOpenFilterDropdown(null);
  };

  const handleClearFilters = () => {
    setOpenFilterDropdown(null);
    updateUrl({
      categories: [],
      healthGoals: [],
      ingredients: [],
      hasStandupPouch: false,
      page: 1,
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    const next = urlState.selectedCategories.includes(categoryId)
      ? urlState.selectedCategories.filter((id) => id !== categoryId)
      : [...urlState.selectedCategories, categoryId];

    updateUrl({ categories: next, page: 1 });
  };

  const handleHealthGoalChange = (goal: string) => {
    const next = urlState.selectedHealthGoals.includes(goal)
      ? urlState.selectedHealthGoals.filter((item) => item !== goal)
      : [...urlState.selectedHealthGoals, goal];

    updateUrl({ healthGoals: next, page: 1 });
  };

  const handleIngredientChange = (ingredientId: string) => {
    const next = urlState.selectedIngredients.includes(ingredientId)
      ? urlState.selectedIngredients.filter((id) => id !== ingredientId)
      : [...urlState.selectedIngredients, ingredientId];

    updateUrl({ ingredients: next, page: 1 });
  };

  const handleStandupPouchToggle = () => {
    updateUrl({ hasStandupPouch: !urlState.hasStandupPouch, page: 1 });
  };

  const handleSortChange = (sortId: string) => {
    setIsSortDropdownOpen(false);
    updateUrl({ sortBy: sortId, page: 1 });
  };

  const handlePageChange = (nextPage: number) => {
    updateUrl({ page: nextPage });
  };

  // Scroll to top when page changes
  useEffect(() => {
    if (!showProductsSkeleton && productsTopRef.current) {
      // Small delay to ensure content is rendered
      setTimeout(() => {
        // @ts-ignore
        const smoother = (window as any).ScrollSmoother?.get?.();
        if (smoother) {
          smoother.scrollTo(0, true);
        } else {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }

        // After DOM + scroll position settles, recalculate animation trigger points.
        // This is critical for AOS-driven footer elements when switching to an empty state.
        requestAnimationFrame(() => {
          smoother?.refresh?.();
          ScrollTrigger.refresh();
          AOS.refreshHard();
        });
      }, 100);
    }
  }, [urlState.page, showProductsSkeleton]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filtersBarRef.current &&
        !filtersBarRef.current.contains(event.target as Node)
      ) {
        setOpenFilterDropdown(null);
      }
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const breadcrumbs = [
    { label: tCommon("home"), href: "/" },
    { label: t("products"), isActive: true },
  ];

  const handleWishlistToggle =
    (product: any) => (wasLiked: boolean, nowLiked: boolean) => {
      if (!wasLiked && nowLiked) {
        setSelectedFavoriteProduct(product);
        setIsFavoritePopupOpen(true);
      }
    };

  // Props for the full-width dropdown panel shown on mobile (avoids clipping
  // inside the horizontally scrollable filter chip row).
  const mobileDropdownProps = useMemo(() => {
    switch (openFilterDropdown) {
      case "category":
        return {
          isOpen: true,
          options: Array.isArray(categories) ? categories : [],
          selectedValues: urlState.selectedCategories,
          onToggle: handleCategoryChange,
          getOptionId: (category: any) => category?.slug,
          getOptionLabel: (category: any) => category?.name,
          isLoading: isCategoriesFetching,
          isError: isCategoriesError && !isCategoriesFetching,
          emptyLabel: t("errorLoadingProduct"),
        };
      case "healthGoal":
        return {
          isOpen: true,
          options: healthGoals,
          selectedValues: urlState.selectedHealthGoals,
          onToggle: handleHealthGoalChange,
          getOptionId: (goal: any) => goal.title,
          getOptionLabel: (goal: any) => goal.title,
          isLoading: isGoalsFetching,
          isError: isGoalsError && !isGoalsFetching,
          emptyLabel: t("errorLoadingProduct"),
        };
      case "ingredient":
        return {
          isOpen: true,
          options: ingredientOptions,
          selectedValues: urlState.selectedIngredients,
          onToggle: handleIngredientChange,
          getOptionId: (ingredient: any) => ingredient._id,
          getOptionLabel: (ingredient: any) => ingredient.name,
          isLoading: isIngredientsInitialLoading,
          isLoadingMore: isLoadingMoreIngredients,
          isError:
            isIngredientsError &&
            !isIngredientsFetching &&
            !isIngredientsInitialLoading,
          emptyLabel: t("errorLoadingProduct"),
          onScroll: handleIngredientScroll,
        };
      default:
        return { isOpen: false, options: [], selectedValues: [], onToggle: () => {}, getOptionId: () => "", getOptionLabel: () => "" };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    openFilterDropdown,
    categories,
    healthGoals,
    ingredientOptions,
    urlState.selectedCategories,
    urlState.selectedHealthGoals,
    urlState.selectedIngredients,
    isCategoriesFetching,
    isCategoriesError,
    isGoalsFetching,
    isGoalsError,
    isIngredientsInitialLoading,
    isLoadingMoreIngredients,
    isIngredientsError,
    isIngredientsFetching,
  ]);

  return (
    <section className="min-h-screen">
      {selectedFavoriteProduct && (
        <FavoritePopup
          product={{
            id: selectedFavoriteProduct._id,
            name: selectedFavoriteProduct.title,
            description:
              selectedFavoriteProduct.shortDescription ||
              selectedFavoriteProduct.description?.replace(/<[^>]*>/g, ""),
            price:
              selectedFavoriteProduct.sachetPrices?.thirtyDays
                ?.discountedPrice ||
              selectedFavoriteProduct.price?.amount ||
              0,
            originalPrice:
              selectedFavoriteProduct.sachetPrices?.thirtyDays?.amount ||
              selectedFavoriteProduct.price?.amount ||
              0,
            currency: resolveProductCurrency(selectedFavoriteProduct),
            rating: selectedFavoriteProduct.averageRating || 5.0,
            reviewCount: selectedFavoriteProduct.ratingCount || 0,
            images: {
              front:
                selectedFavoriteProduct.productImage ||
                "/products/pro_detail0.png",
              gallery: selectedFavoriteProduct.galleryImages || [],
            },
            category:
              selectedFavoriteProduct.categories?.[0]?.name || "Supplements",
            inStock: selectedFavoriteProduct.status !== false,
          }}
          isOpen={isFavoritePopupOpen}
          onClose={() => setIsFavoritePopupOpen(false)}
        />
      )}

      <div className="hidden md:block">
        <Banner
          backgroundImage={heroImageSrc}
          breadcrumbs={breadcrumbs}
          title={t("wellnessEssentialsTitle")}
          description={t("wellnessEssentialsDescription")}
        />
      </div>

      {/* FILTERS BAR */}
      <div
        ref={productsTopRef}
        className="relative z-40 w-section max-sm:px-3 mx-auto pt-6 md:pt-8 lg:pt-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-4"
      >
        <div ref={filtersBarRef} className="relative min-w-0 flex-1">
          <div
            ref={filtersScrollRef}
            className="flex flex-nowrap items-center gap-2 sm:gap-3 overflow-x-auto hide-scrollbar"
          >
          <button
            type="button"
            onClick={handleClearFilters}
            className={`h-10 shrink-0 whitespace-nowrap px-5 rounded-full text-sm font-medium shadow-sm 3xl:text-lg transition-colors cursor-pointer ${
              !hasActiveFilters
                ? "bg-teal-green-color text-white"
                : "bg-slate-50-color hover:bg-neutral-100"
            }`}
          >
            {t("all")}
          </button>

          <div
            ref={categoryFilterRef}
            className={`relative shrink-0 ${
              openFilterDropdown === "category" ? "z-[110]" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => toggleFilterDropdown("category")}
              className={`h-10 shrink-0 whitespace-nowrap px-5 rounded-full text-sm 3xl:text-lg flex items-center justify-center gap-2 font-medium cursor-pointer transition-colors ${
                urlState.selectedCategories.length > 0
                  ? "bg-teal-green-color text-white"
                  : "bg-slate-50-color hover:bg-neutral-100"
              }`}
            >
              {t("category")}
              <span
                className={`flex items-center transition-transform duration-200 ${
                  openFilterDropdown === "category" ? "rotate-180" : ""
                }`}
              >
                <DropdownDownArrow />
              </span>
            </button>
          </div>

          <div
            ref={healthGoalFilterRef}
            className={`relative shrink-0 ${
              openFilterDropdown === "healthGoal" ? "z-[110]" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => toggleFilterDropdown("healthGoal")}
              className={`h-10 shrink-0 whitespace-nowrap px-5 rounded-full text-sm 3xl:text-lg flex items-center justify-center gap-2 font-medium cursor-pointer transition-colors ${
                urlState.selectedHealthGoals.length > 0
                  ? "bg-teal-green-color text-white"
                  : "bg-slate-50-color hover:bg-neutral-100"
              }`}
            >
              {t("healthGoal")}
              <span
                className={`flex items-center transition-transform duration-200 ${
                  openFilterDropdown === "healthGoal" ? "rotate-180" : ""
                }`}
              >
                <DropdownDownArrow />
              </span>
            </button>
          </div>

          <div
            ref={ingredientFilterRef}
            className={`relative shrink-0 ${
              openFilterDropdown === "ingredient" ? "z-[110]" : ""
            }`}
          >
            <button
              type="button"
              onClick={() => toggleFilterDropdown("ingredient")}
              className={`h-10 shrink-0 whitespace-nowrap px-5 rounded-full text-sm 3xl:text-lg flex items-center justify-center gap-2 font-medium cursor-pointer transition-colors ${
                urlState.selectedIngredients.length > 0
                  ? "bg-teal-green-color text-white"
                  : "bg-slate-50-color hover:bg-neutral-100"
              }`}
            >
              {t("ingredient")}
              <span
                className={`flex items-center transition-transform duration-200 ${
                  openFilterDropdown === "ingredient" ? "rotate-180" : ""
                }`}
              >
                <DropdownDownArrow />
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleStandupPouchToggle}
            className={`h-10 shrink-0 whitespace-nowrap px-5 rounded-full text-sm font-medium 3xl:text-lg transition-colors cursor-pointer ${
              urlState.hasStandupPouch
                ? "bg-teal-green-color text-white"
                : "bg-slate-50-color hover:bg-neutral-100"
            }`}
          >
            {t("standupPouches")}
          </button>
          </div>

          {/* Filter dropdown panels — rendered outside the scrollable chip row
              so overflow-x-auto does not clip the menu on any screen size. */}
          {openFilterDropdown && (
            <>
              <div className="lg:hidden absolute top-full left-0 right-0 mt-3 z-[120]">
                <FilterCheckboxDropdown mobile {...mobileDropdownProps} />
              </div>
              <div
                className="hidden lg:block absolute top-full mt-3 z-[120]"
                style={{ left: dropdownPosition.left }}
              >
                <FilterCheckboxDropdown {...mobileDropdownProps} />
              </div>
            </>
          )}
        </div>

        {/* SEARCH BAR */}
        <div className="relative w-full shrink-0 lg:max-w-md">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t("searchAllProducts")}
            className="w-full h-10 3xl:min-w-100 pl-10 pr-4 py-2 3xl:py-2 rounded-full lg:rounded-lg border border-gains-light-boro bg-white text-sm md:text-base outline-none! focus:border-gray-300 transition-all placeholder:text-gray-400"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black-color">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
              />
            </svg>
          </span>
        </div>
      </div>

      <div className="w-section mx-auto px-3 md:px-0 mt-4">
        <div className="h-px bg-slate-border-color" />
      </div>

      {/* RESULTS INFO BAR */}
      <div className="relative z-30">
        <div className="w-section max-sm:px-3 mx-auto py-3 md:py-6">
          {showProductsSkeleton ? (
            <ResultsInfoSkeleton />
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <p className="text-sm md:text-sm text-gray-warm 3xl:text-lg">
                {t("showingResultsFor")}{" "}
                <span className="text-black-color font-medium">{resultsLabel}</span>
              </p>

              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <span className="text-sm md:text-sm text-gray-warm 3xl:text-lg whitespace-nowrap">
                  {t("sortBy")}
                </span>

                <div
                  className={`relative ${isSortDropdownOpen ? "z-[110]" : ""}`}
                  ref={sortDropdownRef}
                >
                  <button
                    onClick={toggleSortDropdown}
                    className="text-sm md:text-sm cursor-pointer text-black-color font-medium transition-colors duration-200 flex items-center gap-1 3xl:text-lg whitespace-nowrap"
                  >
                    {t(sortOptions.find((o) => o.id === urlState.sortBy)?.label || "relevance")}
                    <span
                      className={`transition-transform duration-200 ${
                        isSortDropdownOpen ? "rotate-180" : ""
                      }`}
                    >
                      <DropdownDownArrow />
                    </span>
                  </button>

                  {isSortDropdownOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 z-[100] origin-top animate-in fade-in-0 slide-in-from-top-2 duration-200 ease-out">
                      <div className="py-1">
                        {sortOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleSortChange(option.id)}
                            className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors duration-150 ${
                              urlState.sortBy === option.id
                                ? "text-teal-green-color font-medium bg-teal-50"
                                : "text-gray-700"
                            }`}
                          >
                            {t(option.label)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRODUCT GRID */}
      <div className="relative z-0">
        <div className="w-section max-sm:px-3 mx-auto mb-12 3xl:mb-15 grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
          {showProductsSkeleton ? (
            Array.from({ length: productsPerPage }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <p className="text-red-500 text-lg">
                {tCommon("error")}: {t("errorLoadingProduct")}
              </p>
            </div>
          ) : Array.isArray(products) && products.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">{t("productNotFound")}</p>
            </div>
          ) : (
            Array.isArray(products) &&
            products.map((product: any) => (
              <article
                key={product._id}
                className="bg-offwhite-color rounded-2xl overflow-hidden duration-300 product-card-group flex flex-col"
              >
                <Link href={`/products/${product._id}`}>
                  <div className="aspect-square m-1.25 rounded-2xl bg-gray-100 relative overflow-hidden cursor-pointer">
                    <WishlistToggle
                      productId={product._id}
                      initialIsLiked={product?.is_liked ?? false}
                      className="absolute top-2 right-2 z-10"
                      onToggle={handleWishlistToggle(product)}
                    />

                    <FallbackImage
                      src={product.productImage}
                      alt={`${product.title} front view`}
                      fill
                      className="object-cover transition-opacity duration-300 fav-img"
                    />

                    <FallbackImage
                      src={
                        product.galleryImages?.[0] || product.productImage
                      }
                      alt={`${product.title} back view`}
                      fill
                      className="object-cover transition-opacity duration-300 opacity-0 fav-alter-img absolute inset-0"
                    />

                    <div className="hidden md:block absolute inset-x-4 -bottom-1 pb-2.5 transition-all duration-500! transform translate-y-2 fav-btn">
                      <Button
                        animateText
                        size="elevate"
                        variant="elevate"
                        onClick={(e) => {
                          e.preventDefault();
                          handleAddToCart(product._id, product.hasStandupPouch);
                        }}
                        className="w-full bg-black text-white px-4 font-medium transition-all duration-200 shadow-lg"
                      >
                        <span className="truncate wrap-break-word block">{t("addToCart")}</span>
                      </Button>
                    </div>
                  </div>
                </Link>

                <Link
                  className="flex-1 flex flex-col w-full"
                  href={`/products/${product._id}`}
                >
                  <div className="p-3 md:p-4 flex-1 flex flex-col w-full">
                    <h3 className="font-semibold text-sm leading-snug md:text-xl 3xl:text-[21px] text-black-color mb-1 font-saans line-clamp-2 hover:text-teal-green-color transition-colors duration-200 cursor-pointer">
                      {product.title}
                    </h3>

                    <p className="sub-heading-style text-xs md:text-base mb-2 md:mb-4 line-clamp-2">
                      {product.shortDescription ||
                        product.description?.replace(/<[^>]*>/g, "")}
                    </p>

                    <div className="flex items-center justify-between mt-auto">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-sm md:text-base font-semibold text-black-color 3xl:text-lg">
                          {getCurrencySymbol(product.price.currency)}
                          {product.sachetPrices?.thirtyDays?.discountedPrice?.toFixed(
                            2
                          ) || product.price.amount?.toFixed(2)}
                        </span>

                        {product.sachetPrices?.thirtyDays?.amount &&
                          product.sachetPrices.thirtyDays.amount !==
                            product.sachetPrices.thirtyDays.discountedPrice && (
                            <span className="text-xs md:text-sm text-gray-warm line-through 3xl:text-lg">
                              {getCurrencySymbol(product.price.currency)}
                              {product.sachetPrices.thirtyDays.amount.toFixed(
                                2
                              )}
                            </span>
                          )}
                      </div>

                      {/* <div className="flex items-center text-sm gap-1 text-black-color">
                        <div className="flex items-center gap-1">
                          <BlackStarIcon />
                          <span className="font-medium text-sm text-black-color 3xl:text-base">
                            {(product.averageRating || 0).toFixed(1)}
                          </span>
                        </div>
                        <span className="text-black-color font-extralight text-lg">
                          |
                        </span>
                        <span className="text-sm text-black-color font-medium 3xl:text-base">
                          {product.ratingCount || 0}{" "}
                          {product.ratingCount === 1
                            ? t("review")
                            : t("reviews")}
                        </span>
                      </div> */}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleAddToCart(product._id, product.hasStandupPouch);
                      }}
                      className="md:hidden mt-2.5 w-full h-9 rounded-lg bg-black text-white text-[13px] font-medium transition-colors duration-200 cursor-pointer active:scale-[0.98]"
                    >
                      <span className="truncate block px-2">{t("addToCart")}</span>
                    </button>
                  </div>
                </Link>
              </article>
            ))
          )}
        </div>

        {pagination && pagination.pages > 1 && (
          <div className="mb-12 3xl:mb-15">
            <Pagination
              currentPage={urlState.page}
              totalPages={pagination.pages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </section>
  );
}
