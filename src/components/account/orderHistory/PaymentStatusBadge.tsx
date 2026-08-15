"use client";

import { useTranslations } from "next-intl";
import {
  getPaymentStatusDotStyle,
  getPaymentStatusLabelKey,
  getPaymentStatusStyle,
} from "./paymentStatus";

interface PaymentStatusBadgeProps {
  status?: string | null;
  className?: string;
}

export default function PaymentStatusBadge({
  status,
  className = "",
}: PaymentStatusBadgeProps) {
  const t = useTranslations("Account");
  if (!status?.trim()) return null;

  const labelKey = getPaymentStatusLabelKey(status);
  const label = labelKey ? t(labelKey) : status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold leading-none ${getPaymentStatusStyle(
        status
      )} ${className}`}
    >
      <span
        className={`size-1.5 shrink-0 rounded-full ${getPaymentStatusDotStyle(
          status
        )}`}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}
