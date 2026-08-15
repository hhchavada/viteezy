"use client";

import React from "react";
import { FilterType, OrderFilterNavProps } from "@/components/types/account";
import { useTranslations } from "next-intl";

const OrderFilterNav: React.FC<OrderFilterNavProps> = ({
  activeFilter,
  onFilterChange,
  counts,
}) => {
  const t = useTranslations("Account");
  const filters: { label: string; value: FilterType }[] = [
    { label: t("filterAll"), value: "all" },
    { label: t("filterActive"), value: "active" },
    { label: t("filterDelivered"), value: "delivered" },
  ];

  return (
    <div className="flex items-center gap-2">
      {filters.map((filter) => {
        const count = counts?.[filter.value] ?? 0;
        return (
          <button
            key={filter.value}
            onClick={() => onFilterChange(filter.value)}
            className={`shrink-0 px-3 4xl:px-5 py-1.5 4xl:py-2 rounded-full text-sm 4xl:text-base font-medium 4xl:font-semibold transition-colors border border-transparent cursor-pointer ${activeFilter === filter.value
                ? "bg-teal-500 text-white"
              : "bg-slate-50-color text-gray-700 hover:bg-gray-100 hover:border-gray-200"
              }`}
          >
            {filter.label}
            {counts && (
              <span className="ml-1.5 opacity-75">({count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default OrderFilterNav;
