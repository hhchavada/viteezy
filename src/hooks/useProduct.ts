import { useMemo } from "react";
import {
  useGetProductByIdQuery,
  useGetProductsQuery,
} from "@/store/api/productApi";
import { Product } from "@/components/types";
import { resolveLocalizedValue, resolveProductCurrency } from "@/lib/utils";
import { useLocale } from "next-intl";
import type { SimilarProduct } from "@/store/api/types/product.types";

const FALLBACK_SIMILAR_PRODUCTS_LIMIT = 4;

export const useProduct = (productId: string) => {
  const locale = useLocale();
  const { data, isLoading, error } = useGetProductByIdQuery(productId);

  const responseData = data?.data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const productData = (responseData?.product || responseData) as any;
  const curatedSimilarProducts: SimilarProduct[] =
    responseData?.similarProducts ?? [];

  const categorySlug =
    productData?.categories?.[0]?.slug as string | undefined;

  const shouldFetchFallbackSimilarProducts =
    !isLoading &&
    !!productData &&
    curatedSimilarProducts.length === 0 &&
    !!categorySlug;

  const { data: fallbackProductsData, isLoading: isFallbackLoading } =
    useGetProductsQuery(
      {
        categories: categorySlug,
        sortBy: "latest",
        limit: FALLBACK_SIMILAR_PRODUCTS_LIMIT + 1,
        page: 1,
      },
      { skip: !shouldFetchFallbackSimilarProducts }
    );

  const similarProducts = useMemo(() => {
    if (curatedSimilarProducts.length > 0) {
      return curatedSimilarProducts;
    }

    const fallbackProducts = fallbackProductsData?.data ?? [];

    return fallbackProducts
      .filter((product) => product._id !== productId)
      .slice(0, FALLBACK_SIMILAR_PRODUCTS_LIMIT) as SimilarProduct[];
  }, [
    curatedSimilarProducts,
    fallbackProductsData?.data,
    productId,
  ]);

  const product: Product | null = productData
    ? {
        id: productData._id,
        name: resolveLocalizedValue(productData.title, locale),
        description:
          resolveLocalizedValue(productData.description, locale).replace(
            /<[^>]*>/g,
            "",
          ) || resolveLocalizedValue(productData.shortDescription, locale),
        price:
          productData.sachetPrices?.thirtyDays?.discountedPrice ||
          productData.price?.amount ||
          0,
        originalPrice:
          productData.sachetPrices?.thirtyDays?.amount ||
          productData.price?.amount ||
          0,
        currency: resolveProductCurrency(productData),
        rating: productData.averageRating || 5.0,
        reviewCount: productData.ratingCount || 0,
        images: {
          front: productData.productImage || "",
          gallery: productData.galleryImages || [],
        },
        category:
          resolveLocalizedValue(productData.categories?.[0]?.name, locale) ||
          "Supplements",
        inStock: productData.status !== false,
      }
    : null;

  return {
    product,
    productData,
    similarProducts,
    isLoading: isLoading || (shouldFetchFallbackSimilarProducts && isFallbackLoading),
    error,
  };
};
