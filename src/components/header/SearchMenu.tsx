"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Backdrop from "../ui/backdrop";
import InputField from "../ui/input";
import { useTranslations } from "next-intl";
import { Search, X } from "../icons";

interface SearchMenuProps {
  isShow: boolean;
  onClose: () => void;
}

const SearchMenu = ({ isShow, onClose }: SearchMenuProps) => {
  const t = useTranslations("Header");
  const router = useRouter();
  const searchParams = useSearchParams();

  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");

  // Sync input with query (?search=)
  useEffect(() => {
    const queryValue = searchParams.get("search") || "";
    setValue(queryValue);
  }, [searchParams]);

  // Auto focus when menu opens
  useEffect(() => {
    if (isShow) {
      const id = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(id);
    }
  }, [isShow]);

  const go = (nextSearch: string) => {
    // Keep existing params (categories/sort), but reset page to 1 on new search
    const params = new URLSearchParams(searchParams.toString());

    if (nextSearch.trim()) params.set("search", nextSearch.trim());
    else params.delete("search");

    params.delete("page"); // reset pagination when searching

    const qs = params.toString();
    router.push(qs ? `/products?${qs}` : "/products");
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    go(value);
  };

  return (
    <>
      <div
        className={`
          absolute left-0 right-0 top-full bg-white -z-10
          overflow-hidden transition-all duration-700 ease-in-out
          origin-top border-t border-slate-border-color
          ${isShow ? "translate-y-0 visible" : "-translate-y-full invisible"}
        `}
      >
        <div className="py-10 w-section max-w-6xl">
          <form onSubmit={handleSubmit} className="flex items-center gap-6">
            <div className="relative flex-1">
              <InputField
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                floating={false}
                className="border border-black text-base py-3 rounded-lg ring-0! pr-12"
                placeholder={t("Search")}
                preIcon={<Search className="h-5.5 w-5.5 text-gray-600" />}
              />
              {value && (
                <button
                  type="button"
                  onClick={() => {
                    setValue("");
                    setTimeout(() => inputRef.current?.focus(), 0);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                  aria-label={t("clearSearch")}
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="border-b-2 border-gray-400 text-sm cursor-pointer hover:border-gray-600"
            >
              {t("Cancel")}
            </button>
          </form>
        </div>
      </div>

      <Backdrop isOpen={isShow} onClose={onClose} zIndex={-20} />
    </>
  );
};

export default SearchMenu;