"use client";
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

export type ViewType = "grid" | "list";

type FaqViewContextValue = {
  viewType: ViewType;
  setViewType: (view: ViewType) => void;
  toggleViewType: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
};

const FaqViewContext = createContext<FaqViewContextValue | null>(null);

export function FaqViewProvider({ children }: { children: React.ReactNode }) {
  const [viewType, setViewType] = useState<ViewType>("grid");
  const [searchQuery, setSearchQuery] = useState("");

  const toggleViewType = useCallback(() => {
    setViewType((prev) => (prev === "grid" ? "list" : "grid"));
  }, []);

  const value = useMemo(
    () => ({ viewType, setViewType, toggleViewType, searchQuery, setSearchQuery }),
    [viewType, toggleViewType, searchQuery]
  );

  return <FaqViewContext.Provider value={value}>{children}</FaqViewContext.Provider>;
}

export function useFaqView() {
  const ctx = useContext(FaqViewContext);
  if (!ctx) throw new Error("useFaqView must be used within FaqViewProvider");
  return ctx;
}

