"use client";

import React, { memo, type ReactNode } from "react";
import { useTranslations } from "next-intl";

function KeyValue({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-slightly-gray text-sm font-medium mb-0.5">{label}</p>
      <p className="text-base 3xl:text-lg font-medium">{value}</p>
    </div>
  );
}

export interface DetailCardRow {
  label: string;
  value: ReactNode;
}

export interface DetailCardProps {
  /** Status badge: display text and optional className (e.g. for Approved/Pending) */
  statusBadge: { label: string; className?: string };
  /** Title next to the badge in the header (e.g. "60 days plan" or "Request #VTZ-...") */
  title: string;
  /** Key-value rows shown in the body grid */
  rows: DetailCardRow[];
  /** Optional reason/footer text below the grid */
  reason?: ReactNode;
  /** When true, card uses opacity-70 (e.g. for non-approved postponements) */
  dimmed?: boolean;
}

function DetailCard({
  statusBadge,
  title,
  rows,
  reason,
  dimmed = false,
}: DetailCardProps) {
  const t = useTranslations("Account");
  const statusClass =
    statusBadge.className ?? "bg-gray-500 text-white";

  return (
    <div
      className={`border border-extra-light-gray rounded-2xl 3xl:rounded-[20px] overflow-hidden transition-opacity ${
        dimmed ? "opacity-40" : "opacity-100"
      }`}
    >
      <div className="px-6 py-4 flex items-center gap-3 bg-soft-slate border-b border-extra-light-gray">
        <span
          className={`inline-flex items-center px-3 py-1 rounded-sm text-sm 3xl:text-base font-medium ${statusClass}`}
        >
          {statusBadge.label}
        </span>
        <span className="text-base 3xl:text-lg font-medium text-gray-900">
          {title}
        </span>
      </div>

      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        {rows.map((row, index) => (
          <KeyValue key={index} label={row.label} value={row.value} />
        ))}
      </div>

      {reason != null && reason !== "" && (
        <div className="px-6 pb-6">
          <KeyValue label={t("reasonLabel")} value={reason} />
        </div>
      )}
    </div>
  );
}

export default memo(DetailCard);
