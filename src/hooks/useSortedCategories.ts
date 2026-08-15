import { useGetCategoriesWithProductsQuery } from "@/store/api/productApi";
import { getLanguageParam } from "@/lib/services/language";
import type { CategoryWithProducts } from "@/store/api/types/product.types";

interface ProcessedCategory {
  label: string;
  href: string;
  productCount: number;
}

export const useSortedCategories = (maxCategories: number = 5) => {
  // Fetch categories with products
  const lang = getLanguageParam();
  const { data: categoriesData, isLoading: isLoadingCategories } = useGetCategoriesWithProductsQuery(
    lang ? { lang } : undefined
  );

  // Process categories: filter, sort by product count, and limit
  const processedCategories: ProcessedCategory[] = categoriesData?.data?.categories
    ?.filter((category: CategoryWithProducts) => category.products && category.products.length > 0)
    ?.sort((a: CategoryWithProducts, b: CategoryWithProducts) => b.products!.length - a.products!.length)
    ?.slice(0, maxCategories)
    ?.map((category: CategoryWithProducts) => ({
      label: category.name,
      href: `/products?categories=${category.slug}`,
      productCount: category.products?.length || 0,
    })) || [];

  return {
    categories: processedCategories,
    isLoading: isLoadingCategories,
    hasCategories: processedCategories.length > 0,
  };
};
