"use client";

import { useEffect, useMemo, useState } from "react";
import ProductImageGallery from "./productDetail/ProductImageGallery";
import ProductInfo from "./productDetail/ProductInfo";
import ProductAccordion from "./productDetail/ProductAccordion";
import SimilarProducts from "./productDetail/SimilarProducts";
import { useProduct } from "@/hooks";
import { useTranslations } from "next-intl";
import { getProductVariantAvailability } from "@/lib/utils";

interface ProductDetailsContentProps {
  productId: string;
  mode?: "default" | "modal";
  /** Subscription plan days — used in Change Order modal pricing. */
  planDays?: number;
}

export default function ProductDetailsContent({
  productId,
  mode = "default",
  planDays,
}: ProductDetailsContentProps) {
  const [selectedPreference, setSelectedPreference] = useState<
    "sachets" | "pouch"
  >("sachets");
  const t = useTranslations("Products");

  const {
    product,
    productData,
    similarProducts,
    isLoading: loading,
    error,
  } = useProduct(productId);

  const variantAvailability = useMemo(
    () => getProductVariantAvailability(productData),
    [productData],
  );

  // Derive the default image based on preference
  const preferenceImage = (() => {
    if (!productData) return "";
    const { hasStandUpPouch } = variantAvailability;
    if (selectedPreference === "pouch" && hasStandUpPouch) {
      return (
        productData.standupPouchImages?.[0] || productData.productImage || ""
      );
    }
    return productData.productImage || product?.images.front || "";
  })();


  // Set default preference when product loads
  useEffect(() => {
    if (!productData) return;
    setSelectedPreference(variantAvailability.defaultPreference);
  }, [productId, productData, variantAvailability.defaultPreference]);

  // Keep preference valid for available variants
  useEffect(() => {
    if (!productData) return;
    const { hasSachets, hasStandUpPouch } = variantAvailability;

    if (selectedPreference === "pouch" && !hasStandUpPouch && hasSachets) {
      setSelectedPreference("sachets");
    } else if (selectedPreference === "sachets" && !hasSachets && hasStandUpPouch) {
      setSelectedPreference("pouch");
    }
  }, [selectedPreference, productData, variantAvailability]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-green-color"></div>
      </div>
    );
  }

  if (error || !product || !productData) {
    return (
      <div className="flex items-center justify-center p-12 text-center">
        <div> 
          <h1 className="text-2xl font-bold text-gray-900">
            {t("productNotFound")}
          </h1>
          <p className="text-gray-600 mt-2">{t("productNotFoundDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 md:gap-12 3xl:gap-15 items-start">
      {/* Left Column - Product Images (50%) */}
      <ProductImageGallery
        product={product}
        productData={productData}
        selectedPreference={selectedPreference}
      />

      {/* Right Column - Product Information (50%) */}
      <div className="space-y-6">
        <ProductInfo
          product={product}
          productData={productData}
          selectedPreference={selectedPreference}
          setSelectedPreference={setSelectedPreference}
          mode={mode}
          planDays={planDays}
        />

        {/* Accordion Sections */}
        <ProductAccordion productData={productData} />

        {/* Similar Products */}
        {mode !== "modal" && (
          <SimilarProducts
            similarProducts={similarProducts}
            selectedPreference={selectedPreference}
          />
        )}
      </div>
    </div>
  );
}
