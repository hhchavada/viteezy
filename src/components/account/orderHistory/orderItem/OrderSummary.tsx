"use client";

import { Order } from "@/components/types/account";
import { getCurrencySymbol } from "@/lib/utils";
import React, { memo } from "react";
import { useTranslations } from "next-intl";
import PaymentStatusBadge from "../PaymentStatusBadge";

interface OrderItemCardProps {
  order: Order;
}

const OrderSummary: React.FC<OrderItemCardProps> = ({ order }) => {
  const t = useTranslations("Account");
  // Use grandTotal from pricing.overall as per the new API structure
  const totalAmount = Number(order?.pricing?.overall?.grandTotal || order?.total);
  const displayTotal = Number.isFinite(totalAmount)
    ? totalAmount.toFixed(2)
    : "0.00";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 bg-muted px-5 py-3 space-y-2">
      <div className="flex flex-wrap gap-8 sm:gap-15">
        <span>
          <p className="text-gray-400 text-[13px] font-medium">
            {t("orderPlaced")}{" "}
          </p>
          <span className="text-gray-900 font-medium">{order.orderDate}</span>
        </span>
        <span>
          <p className="text-gray-400 text-[13px] font-medium">
            {t("totalWithColon")}{" "}
          </p>
          <span className="text-gray-900 font-medium">
            {getCurrencySymbol(
              order?.pricing?.overall?.currency || order?.currency
            )}
            {displayTotal}
          </span>
        </span>
        {order.paymentStatus ? (
          <span>
            <p className="text-gray-400 text-[13px] font-medium">
              {t("paymentStatusLabel")}
            </p>
            <PaymentStatusBadge
              status={order.paymentStatus}
              className="mt-0.5"
            />
          </span>
        ) : null}
      </div>
      <span>
        <p className="text-gray-400 text-[13px] font-medium sm:text-end">
          {t("orderNumberWithColon")}{" "}
        </p>
        <span className="text-gray-900 font-medium">{order.orderNumber}</span>
      </span>
    </div>
  );
};

export default memo(OrderSummary);
