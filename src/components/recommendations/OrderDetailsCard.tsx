"use client";

import { useTranslations } from "next-intl";
import { formatCurrencyAmount } from "@/lib/utils";
import { OrderLineItem } from "@/types/recommendations";
import OrderLineRow from "./OrderLineRow";

interface OrderDetailsCardProps {
  userName: string;
  monthlyPrice: number;
  lineItems: OrderLineItem[];
  currency?: string;
  isCheckoutLoading?: boolean;
  isCheckoutDisabled?: boolean;
  isRestartQuizLoading?: boolean;
  isRestartDisabled?: boolean;
  restartQuizError?: string | null;
  primaryButtonLabel?: string;
  hideRestartQuiz?: boolean;
  onProceedToCheckout?: () => void;
  onRestartQuiz?: () => void;
}

export default function OrderDetailsCard({
  userName,
  monthlyPrice,
  lineItems,
  currency = "EUR",
  isCheckoutLoading = false,
  isCheckoutDisabled = false,
  isRestartQuizLoading = false,
  isRestartDisabled = false,
  restartQuizError = null,
  primaryButtonLabel,
  hideRestartQuiz = false,
  onProceedToCheckout,
  onRestartQuiz,
}: OrderDetailsCardProps) {
  const t = useTranslations("Recommendations");
  const summaryItems = lineItems.filter((item) => item.variant !== "total");
  const totalItem = lineItems.find((item) => item.variant === "total");
  const isActionDisabled = isCheckoutLoading || isRestartQuizLoading;

  return (
    <div className="rounded-2xl border border-[#DCDCDC] bg-white p-4 sm:p-6">
      <h2 className="font-saans text-sm font-normal text-black-color sm:text-base lg:text-lg">
        {t("orderTitle")}
      </h2>

      <div className="mt-3 border-t border-[#DCDCDC]" />

      <div className="mt-3">
        <p className="font-saans text-[10px] font-normal tracking-wide text-light-gray-color lg:text-xs">
          {t("orderMonthlySubscription")}
        </p>
        <div className="mt-2 flex items-start justify-between gap-2">
          <span className="min-w-0 font-saans text-xs font-normal text-black-color sm:text-sm lg:text-base">
            {t("orderPackForUser", { userName })}
          </span>
          <span className="shrink-0 font-saans text-xs font-normal text-black-color sm:text-sm lg:text-base">
            {formatCurrencyAmount(monthlyPrice, currency)}
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {summaryItems.map((item) => (
          <OrderLineRow key={item.label} item={item} />
        ))}
        {totalItem ? <OrderLineRow item={totalItem} /> : null}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl">
        <button
          type="button"
          disabled={isActionDisabled || isCheckoutDisabled || !onProceedToCheckout}
          onClick={onProceedToCheckout}
          className="flex w-full cursor-pointer items-center justify-center gap-2 bg-[#23B299] py-3 font-saans text-sm font-normal text-white transition-colors hover:bg-[#1fa389] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base lg:py-3.5 lg:text-lg"
        >
          {isCheckoutLoading ? (
            <>
              <span className="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              {primaryButtonLabel
                ? t("orderConfirming")
                : t("orderPreparingCheckout")}
            </>
          ) : (
            primaryButtonLabel || t("orderProceedToCheckout")
          )}
        </button>

        {!hideRestartQuiz && onRestartQuiz ? (
          <button
            type="button"
            disabled={isActionDisabled || isRestartDisabled}
            onClick={onRestartQuiz}
            className="flex w-full cursor-pointer items-center justify-center bg-[#F7F6F0] py-3 font-saans text-sm font-normal text-black-color transition-colors hover:bg-[#F0EDE4] disabled:cursor-not-allowed disabled:opacity-60 sm:text-base lg:py-3.5 lg:text-lg"
          >
            {isRestartQuizLoading ? (
              <>
                <span className="size-4 animate-spin rounded-full border-2 border-black/20 border-t-black-color" />
                {t("orderRestartingQuiz")}
              </>
            ) : (
              t("orderRestartQuiz")
            )}
          </button>
        ) : null}
      </div>

      {restartQuizError ? (
        <p className="mt-3 font-saans text-sm text-red-600">{restartQuizError}</p>
      ) : null}
    </div>
  );
}
