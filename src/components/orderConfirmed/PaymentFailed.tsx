"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { CircleX } from "lucide-react";
import { Button } from "../ui/button";

export default function PaymentFailed() {
  const t = useTranslations("OrderConfirmed");
  const searchParams = useSearchParams();

  const errorMessage = useMemo(() => {
    const raw = searchParams.get("error")?.trim() || "";
    if (!raw) return "";
    try {
      return decodeURIComponent(raw.replace(/\+/g, " "));
    } catch {
      return raw;
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-off-white-color">
      <div className="pt-8 lg:pt-12 3xl:pt-16 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center flex flex-col items-center">
          <div
            className="flex h-20 w-20 3xl:h-24 3xl:w-24 items-center justify-center rounded-full bg-red-50 text-red-600"
            aria-hidden
          >
            <CircleX className="h-10 w-10 3xl:h-12 3xl:w-12" strokeWidth={1.5} />
          </div>

          <h1 className="text-2xl 4xl:text-3xl font-semibold mt-6 text-black-color">
            {t("paymentFailedTitle")}
          </h1>
          <p className="text-charcol-gray mt-2 text-base 3xl:text-lg max-w-md">
            {t("paymentFailedSubtitle")}
          </p>

          {errorMessage ? (
            <div className="mt-8 w-full rounded-2xl border border-slate-border-color bg-white px-4 py-3 text-left shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-warm mb-1">
                {t("paymentErrorLabel")}
              </p>
              <p className="text-sm 3xl:text-base text-black-color wrap-break-word">
                {errorMessage}
              </p>
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-warm">{t("paymentFailedGenericHint")}</p>
          )}

          <div className="mt-10 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full sm:w-auto">
            <Link href="/checkout" className="w-full sm:w-auto">
              <Button
                className="w-full text-base! 3xl:text-lg! font-medium! h-11! 3xl:h-12! px-7"
                variant="tealElevate"
                size="elevate"
                animateText
              >
                {t("backToCheckout")}
              </Button>
            </Link>
            <Link href="/products" replace className="w-full sm:w-auto">
              <Button
                className="w-full text-base! 3xl:text-lg! font-medium! h-11! 3xl:h-12! px-7 hover:rounded-lg bg-white! text-black-color border border-text-charcol-gray"
                variant="tealElevate"
                size="elevate"
                animateText
              >
                {t("continueShopping")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
