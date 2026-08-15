"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import InputField from "../ui/input";
import { Search, X } from "lucide-react";
import { routes } from "../constants/route";

interface BannerProps {
  onSearch?: (query: string) => void;
  debounceDelay?: number;
}

const Banner = ({ onSearch, debounceDelay = 500 }: BannerProps) => {
  const [search, setSearch] = useState("");
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();
  const tHeader = useTranslations("Header");
  const tFAQ = useTranslations("FAQ");
  const heroImageSrc = "/faq/faq.png";

  const flushDebounce = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  }, []);

  const handleChange = useCallback(
    (value: string) => {
      setSearch(value);
      flushDebounce();
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        onSearch?.(value);
        // Always show main FAQ when searching so results are visible
        if (value.trim()) {
          router.push(routes.faq);
        }
      }, debounceDelay);
    },
    [onSearch, debounceDelay, router, flushDebounce]
  );

  useEffect(() => () => flushDebounce(), [flushDebounce]);

  return (
    <div className="section-padding overflow-hidden relative bg-linear-to-b from-[#F7F6F0] to-transparent">
      <div
        className="relative bg-cover bg-center bg-no-repeat radius-style h-60 sm:h-75 flex items-center px-4 justify-center"
        style={{ backgroundImage: `url(${heroImageSrc})` }}
      >
        <div className="w-full">
          <h1 className="text-3xl sm:text-4xl text-white font-medium text-center mb-5.5">
            {tHeader("howCanIHelpYouToday")}
          </h1>
          <div className="block mx-auto max-w-2xl w-full relative">
            <InputField
              onChange={(e) => handleChange(e.target.value)}
              value={search}
              placeholder={tFAQ("searchFAQ")}
              className="border-none outline-none text-base bg-white rounded-lg shadow-lg text-black pr-12"
              preIcon={<Search className="w-5 h-5 text-black" />}
              floating={false}
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  onSearch?.("");
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={tHeader("clearSearch")}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;
