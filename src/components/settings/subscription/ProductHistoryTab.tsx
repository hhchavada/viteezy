"use client";

import FallbackImage from "@/components/ui/fallbackImage";
import { Button } from "@/components/ui/button";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import ChooseProductProcessModal from "./modals/ChooseProductProcessModal";
import SelectProductModal from "./modals/SelectProductModal";
import {
  useGetSubscriptionProductsQuery,
  useGetSubscriptionQuery,
} from "@/store/api/subscriptionApi";
import { Info } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  getCurrencySymbol,
  isRemoteImageUrl,
  resolveProductImageUrl,
} from "@/lib/utils";
import {
  buildSubscriptionChangeQuizPath,
  saveSubscriptionQuizChangeContext,
} from "@/lib/subscriptionQuizContext";
import type {
  SubscriptionProduct,
  SubscriptionProductCycle,
} from "@/store/api/types/subsciption.types";

function formatCycleDate(date?: string) {
  if (!date) return "";
  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CycleProductList({
  products,
  emptyLabel,
  fallbackCurrency,
  t,
}: {
  products: SubscriptionProduct[];
  emptyLabel: string;
  fallbackCurrency?: string;
  t: ReturnType<typeof useTranslations<"Account">>;
}) {
  if (products.length === 0) {
    return (
      <p className="text-sm text-gray-500 font-medium py-2">{emptyLabel}</p>
    );
  }

  return (
    <div className="space-y-4">
      {products.map((product) => {
        const imageUrl = resolveProductImageUrl(product.product);
        const currency =
          product.currency ??
          product.product?.price?.currency ??
          product.product?.sachetPrices?.thirtyDays?.currency ??
          fallbackCurrency;
        const symbol = getCurrencySymbol(currency);
        const displayPrice =
          typeof product.discountedPrice === "number"
            ? product.discountedPrice
            : product.totalAmount;

        return (
          <div
            key={product.productId}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-4 min-w-0">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-neutral-sand-100 shrink-0">
                <FallbackImage
                  src={imageUrl}
                  alt={product.name}
                  fill
                  className="object-cover"
                  unoptimized={isRemoteImageUrl(imageUrl)}
                />
              </div>
              <div className="min-w-0">
                <h4 className="font-medium text-lg 3xl:text-xl truncate">
                  {product.name}
                </h4>
                <p className="text-gray-500 text-base 3xl:text-lg">
                  {t("capsulesCount", { count: product.capsuleCount })}
                </p>
              </div>
            </div>
            <p className="font-semibold text-lg 3xl:text-xl shrink-0 ml-3">
              {symbol}
              {displayPrice.toFixed(2)}
            </p>
          </div>
        );
      })}
    </div>
  );
}

function CycleSection({
  title,
  subtitle,
  cycle,
  dateLabel,
  products,
  emptyLabel,
  fallbackCurrency,
  t,
  variant = "default",
}: {
  title: string;
  subtitle?: string;
  cycle?: SubscriptionProductCycle;
  dateLabel?: string;
  products: SubscriptionProduct[];
  emptyLabel: string;
  fallbackCurrency?: string;
  t: ReturnType<typeof useTranslations<"Account">>;
  variant?: "default" | "next";
}) {
  return (
    <section
      className={
        variant === "next"
          ? "rounded-xl border border-teal-green-color/20 bg-teal-green-color/5 p-4 sm:p-5"
          : "rounded-xl border border-neutral-sand-100 bg-neutral-sand-50/50 p-4 sm:p-5"
      }
    >
      <div className="mb-4">
        <h4 className="text-base sm:text-lg font-semibold text-charcol-color">
          {title}
        </h4>
        {subtitle && (
          <p className="text-sm text-slightly-gray font-medium mt-1">
            {subtitle}
          </p>
        )}
        {cycle?.label && (
          <p className="text-sm font-medium text-teal-green-color mt-1">
            {cycle.label}
            {dateLabel ? ` · ${dateLabel}` : ""}
          </p>
        )}
      </div>
      <CycleProductList
        products={products}
        emptyLabel={emptyLabel}
        fallbackCurrency={fallbackCurrency}
        t={t}
      />
    </section>
  );
}

const ProductHistoryTab = ({
  subscriptionId,
  subscriptionStatus,
  subscriptionRelation,
  cycleDays,
}: {
  subscriptionId: string;
  subscriptionStatus?: string;
  subscriptionRelation?: string;
  cycleDays?: number;
}) => {
  const t = useTranslations("Account");
  const router = useRouter();
  const { data: subscriptionProductsData, isLoading } =
    useGetSubscriptionProductsQuery(subscriptionId);
  // List API includes subscriptionRelation — match by subscriptionId
  const { data: subscriptionsListData } = useGetSubscriptionQuery({
    page: 1,
    limit: 100,
  });
  const [isChooseModalOpen, setIsChooseModalOpen] = useState(false);
  const [isSelectProductModalOpen, setIsSelectProductModalOpen] =
    useState(false);

  const handleOpenChooseModal = () => setIsChooseModalOpen(true);
  const handleCloseChooseModal = () => setIsChooseModalOpen(false);

  const handleOpenSelectProductModal = () => {
    setIsSelectProductModalOpen(true);
  };
  const handleCloseSelectProductModal = () => {
    setIsSelectProductModalOpen(false);
  };

  const handleBuyNow = () => {
    handleCloseChooseModal();
    handleOpenSelectProductModal();
  };

  const matchedSubscription = useMemo(
    () =>
      subscriptionsListData?.data?.find((item) => item.id === subscriptionId),
    [subscriptionsListData?.data, subscriptionId],
  );

  const resolvedCycleDays =
    cycleDays ?? matchedSubscription?.cycleDays;

  const handleTakeQuiz = () => {
    handleCloseChooseModal();
    saveSubscriptionQuizChangeContext(subscriptionId, resolvedCycleDays);
    router.push(
      buildSubscriptionChangeQuizPath(subscriptionId, resolvedCycleDays)
    );
  };

  const subscriptionData = subscriptionProductsData?.data;
  const currentCycleProducts =
    subscriptionData?.currentCycle?.items ?? subscriptionData?.items ?? [];
  const nextCycleProducts = subscriptionData?.nextCycle?.items ?? [];
  const changeWindowDays = subscriptionData?.changeWindowDays ?? 10;

  const isPaused =
    subscriptionStatus?.toLowerCase() === "paused" ||
    subscriptionStatus === "Paused";
  const isCancelled = subscriptionStatus === "Cancelled";

  // Change Order only when this subscriptionId is a "self" subscription
  const relation = (
    matchedSubscription?.subscriptionRelation ??
    subscriptionRelation ??
    ""
  ).toLowerCase();
  const canChangeOrder = relation === "self" && !isPaused && !isCancelled;

  if (isLoading) {
    return <div>{t("loadingProducts")}</div>;
  }

  return (
    <div className="mt-6 border rounded-2xl overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-center gap-4">
          <div>
            <h3 className="text-xl font-semibold">{t("changeProduct")}</h3>
            <p className="text-slightly-gray font-medium">
              {t("selectDifferentProductForDelivery")}
            </p>
          </div>
          {canChangeOrder && (
            <Button
              onClick={handleOpenChooseModal}
              variant="elevate"
              size="elevate-md"
              animateText
              className="shrink-0"
            >
              {t("changeOrder")}
            </Button>
          )}
        </div>

        <div className="mt-5 space-y-5">
          <CycleSection
            title={t("currentCycle")}
            cycle={subscriptionData?.currentCycle}
            dateLabel={
              subscriptionData?.currentCycle?.effectiveUntil
                ? t("cycleActiveUntil", {
                    date: formatCycleDate(
                      subscriptionData.currentCycle.effectiveUntil,
                    ),
                  })
                : undefined
            }
            products={currentCycleProducts}
            emptyLabel={t("noProductsInCycle")}
            fallbackCurrency={subscriptionData?.currency}
            t={t}
          />

          <CycleSection
            title={t("nextCycle")}
            subtitle={t("yourNextCycleProducts")}
            cycle={subscriptionData?.nextCycle}
            dateLabel={
              subscriptionData?.nextCycle?.effectiveFrom
                ? t("cycleStartsFrom", {
                    date: formatCycleDate(
                      subscriptionData.nextCycle.effectiveFrom,
                    ),
                  })
                : undefined
            }
            products={nextCycleProducts}
            emptyLabel={t("noProductsInCycle")}
            fallbackCurrency={subscriptionData?.currency}
            t={t}
            variant="next"
          />
        </div>
      </div>
      <div className="text-sm text-concord bg-white-smoke px-5 py-3 flex items-center gap-2">
        <Info className="w-5 h-5 shrink-0" />
        <p className="font-medium">
          {t("productChangeNotice", { days: changeWindowDays })}
        </p>
      </div>
      <ChooseProductProcessModal
        isOpen={isChooseModalOpen}
        onClose={handleCloseChooseModal}
        onBuyNow={handleBuyNow}
        onTakeQuiz={handleTakeQuiz}
      />
      <SelectProductModal
        isOpen={isSelectProductModalOpen}
        onClose={handleCloseSelectProductModal}
        subscriptionId={subscriptionId}
        cycleDays={resolvedCycleDays}
      />
    </div>
  );
};

export default ProductHistoryTab;
