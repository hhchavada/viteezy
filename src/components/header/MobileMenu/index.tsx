// components/MobileMenu.tsx
"use client";
import React, { useState } from "react";
import { Home, Search, Crown, ShoppingBag, User } from "lucide-react";
import clsx from "clsx";

const MobileMenu = () => {
  const [activeTab, setActiveTab] = useState("home");

  const menuItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "search", label: "Search", icon: Search },
    { id: "premium", label: "Premium", icon: Crown },
    { id: "cart", label: "Cart", icon: ShoppingBag },
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <div className="block sm:hidden fixed bottom-0 left-0 right-0 z-0 bg-white">
      {/* Optional: Blur backdrop */}
      {/* <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" /> */}

      {/* Main Bottom Bar */}
      <div className="bg-white border-t border-gray-200 shadow-2xl">
        <div className="flex items-center justify-around py-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={clsx(
                  "flex flex-col items-center cursor-pointer justify-center w-full py-3 transition-all duration-300",
                  isActive ? "text-teal-600" : "text-black"
                )}
              >
                <div
                  className={clsx(
                    "relative mb-2 rounded-xl transition-all duration-300"
                  )}
                >
                  <Icon
                    size={21}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={clsx(
                      "transition-all duration-300",
                      isActive && "scale-110"
                    )}
                  />

                  {/* Active Indicator Dot */}
                  {/* {isActive && (
                    <div className="absolute -top-1 -right-1 h-3 w-3 bg-teal-500 rounded-full border-2 border-white shadow-md" />
                  )} */}
                </div>

                <span
                  className={clsx(
                    "text-xs font-medium transition-all duration-300",
                    isActive ? "text-teal-600" : "text-black"
                  )}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
