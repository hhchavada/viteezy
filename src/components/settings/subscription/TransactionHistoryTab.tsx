"use client";

import React, { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/ui/dataTable";
import { useGetTransactionsBySubscriptionQuery } from "@/store/api/userApi";
import { Transaction } from "@/store/api/types/transaction.types";
import { formatDateWithTranslation, getCurrencySymbol } from "@/lib/utils";
import { useTranslations } from "next-intl";

/** Transaction status values from API */
const TRANSACTION_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
} as const;

type FilterType =
  | "all"
  | typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS];

interface TransactionHistoryTabProps {
  subscriptionId: string;
  isTabActive: boolean;
}

const STATUS_STYLES: Record<string, string> = {
  [TRANSACTION_STATUS.PENDING]: "bg-amber-100 text-amber-800",
  [TRANSACTION_STATUS.PROCESSING]: "bg-blue-100 text-blue-800",
  [TRANSACTION_STATUS.COMPLETED]: "bg-light-mint text-aqua-deep",
  [TRANSACTION_STATUS.FAILED]: "bg-pastel-pink text-paprika",
  [TRANSACTION_STATUS.CANCELLED]: "bg-gray-200 text-gray-700",
  [TRANSACTION_STATUS.REFUNDED]: "bg-teal-100 text-teal-800",
};

/** Format amount with / N month(s) based on cycleDays; months only, no years */
function formatAmountWithCycle(
  amount: number,
  currency: string,
  cycleDays?: number,
  monthSingular = "month",
  monthPlural = "months",
): string {
  const symbol = getCurrencySymbol(currency);
  const amountStr =
    typeof amount === "number" ? amount.toFixed(2) : String(amount);
  if (cycleDays != null && cycleDays > 0) {
    const months = Math.round(cycleDays / 30) || 1;
    const monthLabel = months === 1 ? monthSingular : monthPlural;
    return `${symbol}${amountStr} / ${months} ${monthLabel}`;
  }
  return `${symbol}${amountStr}`;
}

export default function TransactionHistoryTab({
  subscriptionId,
  isTabActive,
}: TransactionHistoryTabProps) {
  const t = useTranslations("Account");
  const tMonths = useTranslations("Months");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const filters: { label: string; value: FilterType }[] = [
    { label: t("filterAll"), value: "all" },
    { label: t("orderStatusPending"), value: TRANSACTION_STATUS.PENDING },
    { label: t("orderStatusProcessing"), value: TRANSACTION_STATUS.PROCESSING },
    { label: t("statusCompleted"), value: TRANSACTION_STATUS.COMPLETED },
    { label: t("statusFailed"), value: TRANSACTION_STATUS.FAILED },
    { label: t("statusCancelled"), value: TRANSACTION_STATUS.CANCELLED },
    { label: t("statusRefunded"), value: TRANSACTION_STATUS.REFUNDED },
  ];

  const { data, isLoading, error } = useGetTransactionsBySubscriptionQuery(
    subscriptionId,
    { skip: !isTabActive || !subscriptionId }
  );

  const pagination = data?.pagination;

  const filteredTransactions = useMemo(() => {
    const transactions = data?.data ?? [];
    if (activeFilter === "all") return transactions;
    return transactions.filter((t) => t.status === activeFilter);
  }, [data?.data, activeFilter]);

  const columns: ColumnDef<Transaction>[] = useMemo(
    () => [
      {
        accessorKey: "transactionId",
        header: t("transactionId"),
        cell: ({ row }) => (
          <span className="font-medium truncate max-w-[180px] block">
            {row.original.transactionId || row.original.id}
          </span>
        ),
      },
      {
        accessorKey: "processedAt",
        header: t("orderDate"),
        cell: ({ row }) => (
          <span className="font-medium">
            {formatDateWithTranslation(row.original.processedAt || row.original.createdAt, "DD MMM YYYY", tMonths)}
          </span>
        ),
      },
      {
        accessorKey: "paymentMethod",
        header: t("paymentMethodLabel"),
        cell: ({ row }) => (
          <span className="font-medium">{row.original.paymentMethod}</span>
        ),
      },
      {
        id: "amount",
        header: t("amount"),
        cell: ({ row }) => {
          const tx = row.original;
          const cycleDays = tx.subscription?.cycleDays;
          const text = formatAmountWithCycle(
            tx.amount,
            tx.currency,
            cycleDays,
            t("periodMonthSingular"),
            t("periodMonthPlural"),
          );
          return (
            <span className=" font-medium">{text}</span>
          );
        },
      },
      {
        accessorKey: "status",
        header: t("orderStatus"),
        cell: ({ row }) => {
          const status = row.original.status;
          const style =
            STATUS_STYLES[status] ??
            STATUS_STYLES[status?.toLowerCase() ?? ""] ??
            "bg-gray-100 text-gray-800";
          return (
            <span
              className={`inline-flex items-center px-3 py-1 rounded-md text-xs 3xl:text-base font-semibold capitalize ${style}`}
            >
              {status.toLowerCase() === "pending"
                ? t("orderStatusPending")
                : status.toLowerCase() === "processing"
                  ? t("orderStatusProcessing")
                  : status.toLowerCase() === "completed"
                    ? t("statusCompleted")
                    : status.toLowerCase() === "failed"
                      ? t("statusFailed")
                      : status.toLowerCase() === "cancelled"
                        ? t("statusCancelled")
                        : status.toLowerCase() === "refunded"
                          ? t("statusRefunded")
                          : status}
            </span>
          );
        },
      },
    ],
    [t]
  );

  if (!isTabActive) return null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-gray-500 rounded-lg bg-slate-50 border border-slate-200">
        {t("failedLoadTransactionHistory")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable<Transaction, unknown>
        columns={columns}
        data={filteredTransactions}
        title={t("transactionHistory")}
        filterDropdown={{
          options: filters,
          value: activeFilter,
          onChange: (v) => setActiveFilter(v as FilterType),
          placeholder: t("selectStatus"),
        }}
        showPagination={Boolean(pagination && pagination.pages > 1)}
        pageSize={pagination?.limit ?? 10}
      />
    </div>
  );
}
