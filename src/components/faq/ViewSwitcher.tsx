"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { List } from "lucide-react";
import { Grid } from "../icons";
import { useFaqView } from "@/lib/faqViewContext";

const ViewSwitcher: React.FC = () => {
  const { viewType, setViewType } = useFaqView();
  const tFAQ = useTranslations("FAQ");

  return (
    <div className="flex items-center bg-neutral-100 p-1 rounded-md">
      <button
        onClick={() => setViewType("grid")}
        className={`px-2 py-1.5 rounded-sm transition-colors cursor-pointer ${
          viewType === "grid"
            ? "text-white bg-teal-500"
            : "text-black hover:text-gray-600"
        }`}
        aria-label={tFAQ("gridView")}
      >
        <Grid />
      </button>
      <button
        onClick={() => setViewType("list")}
        className={`px-2 py-1.5 rounded-sm transition-colors cursor-pointer ${
          viewType === "list"
            ? "text-white bg-teal-500"
            : "text-black hover:text-gray-600"
        }`}
        aria-label={tFAQ("listView")}
      >
        <List className="w-4.5 h-4.5" />
      </button>
    </div>
  );
};

export default ViewSwitcher;

