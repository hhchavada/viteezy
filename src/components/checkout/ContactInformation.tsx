"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MoreVertical, LogOut, User } from "lucide-react";
import { useGetUserMeQuery } from "@/store/api/userApi";
import { useLogoutMutation, useAppDispatch } from "@/store";
import { baseApi } from "@/store/api/baseApi";
import { useLogout } from "@/hooks/useLogout";
import { useTranslations } from "next-intl";

const ContactInformation: React.FC = () => {
  const [receiveTips, setReceiveTips] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { data, isLoading } = useGetUserMeQuery();
  const menuRef = useRef<HTMLDivElement>(null);
  const { logout, isLoggingOut } = useLogout();
  const t = useTranslations("Common");
  const tCheckout = useTranslations("Checkout");
  const tHeader = useTranslations("Header");

  const userEmail = data?.data?.user?.email || "";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xl font-semibold text-gray-900">
          {tHeader("account")}
        </h2>
      </div>

      <div className="space-y-4">
        {/* Static Email Display with Menu */}
        <div className="relative">
          <div className="w-full rounded-[12px] border-2 border-extra-light-gray bg-white px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="shrink-0 w-8 h-8 rounded-full bg-extra-light-gray flex items-center justify-center">
                <User className="w-4 h-4 text-gray-500" />
              </div>
              {isLoading ? (
                <div className="text-sm text-gray-500">{t("loading")}</div>
              ) : (
                <div className="text-base text-gray-800 truncate">
                  {userEmail || tCheckout("noEmailAvailable")}
                </div>
              )}
            </div>
            <div className="relative shrink-0" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                aria-label={tCheckout("menu")}
              >
                <MoreVertical className="h-5 w-5 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div
                  className="absolute -right-1 top-full -translate-y-1 mt-2 z-50 text-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* The Arrow/Caret */}
                  <div className="absolute z-1 -top-1.5 right-[50%] translate-x-[50%] w-3 h-3 bg-white border-l border-t border-gray-200 rotate-45" />

                  {/* The Menu Container */}
                  <div className="relative bg-white border shadow-sm border-gray-200 rounded-sm  py-1 overflow-hidden">
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="w-full flex items-center justify-start gap-3 px-3 py-1 text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      <span>{isLoggingOut ? t("logoutLoading") : t("logOut")}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Commented out: Viteezy tips selection
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="receiveTips"
            checked={receiveTips}
            onChange={(e) => setReceiveTips(e.target.checked)}
            className="appearance-none w-5 h-5 border-2 border-gray-300 rounded-sm
               checked:bg-teal-500 checked:border-teal-500 
               cursor-pointer transition-colors
               checked:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEwIDNMNC41IDguNUwyIDUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo=')] 
               checked:bg-center checked:bg-no-repeat checked:bg-size-[12px_12px]"
          />
          <label
            htmlFor="receiveTips"
            className="text-sm text-gray-700 cursor-pointer"
          >
            {tCheckout("receiveViteezyTips")}
          </label>
        </div>
        */}
      </div>
    </div>
  );
};

export default ContactInformation;
