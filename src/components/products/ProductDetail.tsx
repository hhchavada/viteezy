"use client";
import { useEffect, useState } from "react";
import ProductComparisonTable from "./productDetail/ProductComparisonTable";
import ProductIngredientsSection from "./productDetail/ProductIngredientsSection";
import RealCustomerReview from "../home/realCustomerReview";
import FAQSection from "../home/faq";
import ProductDetailsContent from "./ProductDetailsContent";
import ProductsBenefitsOverview from "./productDetail/ProductsBenefitsOverview";
import { ProductDetailProps } from "../types";
import { useProduct } from "@/hooks";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function ProductDetail({
  productId: propProductId,
}: ProductDetailProps) {
  const { id: paramsProductId = "" } = useParams<{ id?: string }>();
  const productId = propProductId || paramsProductId;
  const t = useTranslations("Products");

  const {
    productData,
    isLoading: loading,
    error,
    product,
  } = useProduct(productId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-green-color"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">
            {t("errorLoadingProduct")}
          </h1>
          <p className="text-gray-600 mt-2">{t("errorLoadingProductDesc")}</p>
        </div>
      </div>
    );
  }

  if (!product || !productData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            {t("productNotFound")}
          </h1>
          <p className="text-gray-600 mt-2">{t("productNotFoundDesc")}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="min-h-screen">
      <div className=" pt-12 3xl:pt-14 bg-linear-to-b from-[#F7F6F0] to-[#FAF9F600]">
        {/* Main Product Detail Section */}
        <div className="w-section mx-auto">
          <ProductDetailsContent productId={productId} />
        </div>
        <ProductsBenefitsOverview productData={productData} />

        {productData?.testimonials && productData.testimonials.length > 0 && (
          <div className="px-4 sm:px-6 lg:px-8">
            <RealCustomerReview testimonials={productData?.testimonials} />
          </div>
        )}
      </div>

      <div className="bg-linear-to-b from-[#F7F6F0] to-[#FAF9F600]">
        <ProductComparisonTable productData={productData} />
        <ProductIngredientsSection productData={productData} />
        {productData?.faqs?.length > 0 && (
            <FAQSection
              productFaqs={productData?.faqs}
              className=""
            />
        )}
      </div>
    </section>
  );
}
