"use client";

import React, { useCallback, useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Globe,
  UserRound,
  Crown,
  ChevronDown,
  Handbag,
} from "lucide-react";
import SideMenu from "./SideMenu";
import Image from "next/image";
import { CategoryItem } from "../types/header";
import SubMenu from "./SubMenu";
import LanguageDialog from "./languageDialog";
import { useClickOutside, useLogout } from "@/hooks";
import { useScrollAtTop } from "@/hooks/useScrollAtTop";
import { useIsMobile } from "@/hooks/useIsMobile";
import { useOverlayCloseOnRouteChange } from "@/hooks/useOverlayCloseOnRouteChange";
import { routes } from "../constants/route";
import MegaMenuDropdown from "./megaMenuDropdown";
import { useCartSidebar } from "@/lib/cartSidebar";
import { useTranslations, useLocale } from "next-intl";
import LogoAnimation from "@/components/ui/logoAnimation";
import MobileLogo from "@/components/ui/MobileLogo";
import { Marquee } from "@/components/ui/marquee";
import { cn, getFirstLetter } from "@/lib/utils";
import FixedPortal from "@/components/ui/fixedPortal";
import { useGetCartQuery, useGetQuizRecommendationCartQuery } from "@/store/api/cartApi";
import {
  isQuizCheckoutSessionActive,
  readQuizCheckoutContext,
  toQuizCartParams,
} from "@/components/recommendations/quizCheckoutStorage";
import { useGetHeaderBannerQuery } from "@/store/api/headerBannerApi";
import { useGetUserMeQuery } from "@/store/api/userApi";
import { languages as fallbackLanguages } from "../constants/countries";
import { useGeneralSettings } from "@/hooks/useGeneralSettings";
import { useLandingHeavyQueryGate } from "@/contexts/LandingHeavyQueryGate";
import { useLanguageSwitcher } from "@/hooks/useLanguageSwitcher";
import SearchMenu from "./SearchMenu";
import LanguageFlagIcon from "@/components/ui/LanguageFlagIcon";
import Backdrop from "../ui/backdrop";
import Spinner from "../ui/spinner";

// SubMenu wrapper component with click-outside detection
const SubMenuWrapper: React.FC<{
  itemLabel: string;
  items: Array<{ title: string; slug: string }>;
  onClose: () => void;
  cancelClose: () => void;
  scheduleClose: () => void;
}> = ({ itemLabel, items, onClose, cancelClose, scheduleClose }) => {
  const subMenuRef = useClickOutside<HTMLDivElement>(() => {
    onClose();
  }, [`[data-nav-button="${itemLabel}"]`]);

  return (
    <div 
      ref={subMenuRef}
      onMouseEnter={cancelClose}
      onMouseLeave={scheduleClose}
    >
      <SubMenu items={items} isOpen={true} onClose={onClose} />
    </div>
  );
};

const Header = ({ className }: { className?: string }) => {
  const translate = useTranslations("Header");
  const translateC = useTranslations("Common");
  const tAccount = useTranslations("Account");
  const router = useRouter();
  const locale = useLocale();
  const { data: generalSettings, enabledLanguages } =
    useGeneralSettings(locale);
  const languages = useMemo(
    () => (enabledLanguages.length > 0 ? enabledLanguages : fallbackLanguages),
    [enabledLanguages]
  );
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [selectedNav, setSelectedNav] = useState<string | null>(null);
  const [megaMenuItem, setMegaMenuItems] = useState<CategoryItem[]>([]);
  const [subMenuItem, setSubMenuItems] = useState<
    Array<{ title: string; slug: string }>
  >([]);
  const shopAllTriggerRef = useRef<HTMLAnchorElement | null>(null);
  const megaMenuPanelRef = useRef<HTMLDivElement | null>(null);
  const megaMenuCloseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pathname = usePathname();
  const { openCart, isOpen: isCartSidebarOpen } = useCartSidebar();
  const { allowHeavyQueries, prefetchHeavyQueries } =
    useLandingHeavyQueryGate();
  const isLandingHome =
    pathname === "/" || pathname === "/preview-landing";
  const { logout, isLoggingOut } = useLogout();
  const { changeLanguage } = useLanguageSwitcher();

  const isQuizCheckout = isQuizCheckoutSessionActive();
  const quizCheckoutContext = isQuizCheckout ? readQuizCheckoutContext() : null;
  const quizCartParams = quizCheckoutContext
    ? toQuizCartParams(quizCheckoutContext)
    : undefined;

  // Fetch cart data with auto-refetch on invalidation (defer on landing until idle / cart open)
  const { data: cartData } = useGetCartQuery(undefined, {
    refetchOnFocus: true,
    refetchOnReconnect: true,
    skip:
      isQuizCheckout ||
      (isLandingHome &&
        !allowHeavyQueries &&
        !isCartSidebarOpen),
  });
  const { data: quizCartData } = useGetQuizRecommendationCartQuery(
    quizCartParams!,
    {
      skip: !isQuizCheckout || !quizCartParams,
    }
  );
  const activeCartData = isQuizCheckout ? quizCartData : cartData;

  const { data: headerBannerData } = useGetHeaderBannerQuery(
    { deviceType: "WEB", lang: locale },
    { skip: false }
  );
  const headerBanner = headerBannerData?.data?.headerBanner;
  const showHeaderBanner = Boolean(
    headerBanner?.isActive && headerBanner?.text?.trim()
  );

  // GET /users/me - skip when not logged in; hide Membership in header when user is member or sub-member
  const { data: userMeData } = useGetUserMeQuery(undefined, {
    skip: !isLoggedIn,
  });
  const user = userMeData?.data?.user;
  const userFirstLetter = (
    (user?.firstName || user?.name || "U").trim()[0] || "U"
  ).toUpperCase();
  const userProfileImageUrl =
    (user?.avatar || user?.profileImage)?.trim() || null;
  const hideMembershipInHeader = Boolean(
    user && (user.isMember === true || user.isSubMember === true)
  );

  const userMenuRef = useClickOutside<HTMLDivElement>(() => {
    setIsUserMenuOpen(false);
  });

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      setIsLoggedIn(!!token);
    };

    checkAuth();
    // Check auth on storage change (for logout/login from other tabs)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname]);

  // Update cart count when cart data changes
  useEffect(() => {
    if (activeCartData?.data?.cart) {
      const items = activeCartData.data.cart.items?.length ?? 0;
      setCartCount(items);
    } else {
      setCartCount(0);
    }
  }, [activeCartData]);

  // Sync user language from API to localStorage
  useEffect(() => {
    if (user?.language && isLoggedIn) {
      // Find language code from language name
      const userLanguage = languages.find(lang => lang.name === user.language);
      if (userLanguage) {
        // Always update localStorage to ensure API language takes precedence
        localStorage.setItem("language", userLanguage.name);
        localStorage.setItem("lang", userLanguage.code);

        // Keep active locale in sync with API language (single refresh flow).
        if (userLanguage.code !== locale) {
          void changeLanguage(userLanguage.code);
        }
      }
    }
  }, [user, isLoggedIn, languages, locale, changeLanguage]);

  // Close all overlays on route change
  useOverlayCloseOnRouteChange(() => {
    setIsMenuOpen(false);
    setIsLanguageOpen(false);
    setIsUserMenuOpen(false);
    setIsSearchOpen(false);
    setSelectedNav(null);
    setMegaMenuItems([]);
    setSubMenuItems([]);
  });

  const navigationItems = [
    { label: translateC("quiz"), href: "/quiz", badge: translateC("BadgeNew") },
    {
      label: translate("ShopAll"),
      href: "/shop",
      categories: [
        {
          title: translate("ShopSpecialities"),
          slug: " shop-specialities",
          children: [
            {
              img: "",
              title: translate("ShopSpecialities"),
              description: translate("ProductDescription"),
            },
            {
              img: "",
              title: translate("ShopSpecialities"),
              description: translate("ProductDescription"),
            },
            {
              img: "",
              title: translate("ShopSpecialities"),
              description: translate("ProductDescription"),
            },
          ],
        },
        {
          title: translate("ShopMinerals"),
          slug: "shop-minerals",
          children: [
            {
              img: "",
              title: translate("ShopMinerals"),
              description: translate("ProductDescription"),
            },
            {
              img: "",
              title: translate("ShopMinerals"),
              description: translate("ProductDescription"),
            },
            {
              img: "",
              title: translate("ShopMinerals"),
              description: translate("ProductDescription"),
            },
          ],
        },
        {
          title: translate("ShopSpices"),
          slug: "shop-spices",
          children: [
            {
              img: "",
              title: translate("ShopSpices"),
              description: translate("ProductDescription"),
            },
            {
              img: "",
              title: translate("ShopSpices"),
              description: translate("ProductDescription"),
            },
            {
              img: "",
              title: translate("ShopSpices"),
              description: translate("ProductDescription"),
            },
          ],
        },
        {
          title: translate("ShopVitamins"),
          slug: "shop-vitamins",
          children: [
            {
              img: "",
              title: translate("ShopVitamins"),
              description: translate("ProductDescription"),
            },
            {
              img: "",
              title: translate("ShopVitamins"),
              description: translate("ProductDescription"),
            },
            {
              img: "",
              title: translate("ShopVitamins"),
              description: translate("ProductDescription"),
            },
          ],
        },
      ],
    },
    // { label: translate("Consult"), href: "/consult" },
    // { label: translate("Charity"), href: "/coming-soon" },
    {
      label: translate("Learn"),
      href: "/learn",
      subMenu: [
        {
          title: translate("AboutUs"),
          slug: routes.aboutUs,
        },
        // {
        //   title: translate("OurTeam"),
        //   slug: routes.ourTeam,
        // },
        {
          title: translateC("blog"),
          slug: "/blog",
        },
        {
          title: translateC("faq"),
          slug: "/faq",
        },
        {
          title: translate("Charity"),
          slug: "/coming-soon",
        },
        {
          title: translateC("contactUs"),
          slug: routes.contactUs,
        },
      ],
    },
  ];

  const toggleMegaMenu = (label: string, categories?: CategoryItem[]) => {
    setIsSearchOpen(false);
    setSelectedNav(selectedNav === label ? null : label);
    setMegaMenuItems(categories || []);
  };

  const toggleSubMenu = (
    label?: string,
    subMenu?: Array<{ title: string; slug: string }>
  ) => {
    if (label) {
      // Toggle: if already open, close it; otherwise open it
      setSelectedNav(selectedNav === label ? null : label);
    } else {
      setSelectedNav(null);
    }
    setSubMenuItems(subMenu || []);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleLanguage = () => {
    setIsLanguageOpen(!isLanguageOpen);
  };

  const handleUserMenuHover = () => {
    if (isLoggedIn) {
      setIsUserMenuOpen(true);
    }
  };

  const handleUserMenuLeave = () => {
    setIsUserMenuOpen(false);
  };

  const closeMegaMenu = useCallback(() => {
    // setMegaMenuItems([]);
    setSelectedNav(null);
  }, []);

  const cancelMegaMenuClose = useCallback(() => {
    if (megaMenuCloseTimeoutRef.current) {
      clearTimeout(megaMenuCloseTimeoutRef.current);
      megaMenuCloseTimeoutRef.current = null;
    }
  }, []);

  const scheduleMegaMenuClose = useCallback(() => {
    cancelMegaMenuClose();
    megaMenuCloseTimeoutRef.current = setTimeout(() => {
      closeMegaMenu();
    }, 150);
  }, [cancelMegaMenuClose, closeMegaMenu]);

  useEffect(() => {
    return () => {
      cancelMegaMenuClose();
    };
  }, [cancelMegaMenuClose]);

  const topOfferText = showHeaderBanner
    ? headerBanner!.text
    : translate("topBanner");

  // Determine if banner should be shown
  const shouldShowBanner =
    showHeaderBanner || topOfferText !== translate("topBanner");

  const isAtTop = useScrollAtTop();
  const isMobile = useIsMobile();
  const isBannerVisible = shouldShowBanner && (!isMobile || isAtTop);

  return (
    <FixedPortal>
      <div className="fixed top-0 z-10 left-0 w-full">
        <div data-aos="fade-down" className="relative z-20">
          {/* Top Banner - hides on scroll, shows again at top */}
          {shouldShowBanner && (
            <div
              className={cn(
                "grid transition-[grid-template-rows] duration-300 ease-in-out",
                isBannerVisible ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              )}
            >
              <div className="overflow-hidden">
                <Marquee
                  className="bg-[linear-gradient(90deg,_#ECD2BC_0%,_#B8E2D0_30%,_#C6E2F1_70%,_#B5E5AD_100%)] text-sm font-semibold text-gray-800 3xl:text-[15px] [--duration:12s] h-auto min-h-[32px] flex items-center"
                  repeat={18}
                  pauseOnHover
                >
                  <div className="flex items-center gap-8 px-6 py-1">
                    <span
                      className="whitespace-nowrap"
                      dangerouslySetInnerHTML={{ __html: topOfferText }}
                    />
                  </div>
                </Marquee>
              </div>
            </div>
          )}

          {/* Main Header */}
          <header
            className={cn(
              "bg-off-white-color relative",
              !shouldShowBanner && "top-0",
              className
            )}
          >
            <div className="w-full relative">
              <div className="max-w-[1320px] 3xl:max-w-[1584px] mx-auto px-2.5 sm:px-6 lg:px-8 py-1 md:py-2">
                <div className="relative flex items-center justify-between md:grid md:grid-cols-3 min-h-[48px] md:min-h-[64px] 3xl:min-h-[72px]">
                  {/* Left Section - 40% width */}
                  <div className="flex items-center lg:space-x-4 min-w-0 3xl:-ms-1">
                    <button
                      onClick={toggleMenu}
                      className="p-2 rounded-full hover:bg-white transition-colors duration-200 cursor-pointer flex-shrink-0"
                      aria-label={translateC("toggleMenuAria")}
                    >
                      {isMenuOpen ? (
                        <X className="h-5 w-5 text-gray-600" />
                      ) : (
                        <Menu className="h-5 w-5 text-gray-600" />
                      )}
                    </button>

                    {/* Navigation Items - Desktop */}
                    <nav className="hidden lg:flex items-center space-x-7 flex-1 min-w-0">
                      {navigationItems.map((item, index) => {
                        const hasMega = !!item.categories?.length;
                        const hasSub = !!item.subMenu?.length;
                        const hasMenu = hasMega || hasSub;
                        const isSubMenuOpen =
                          hasSub && selectedNav === item.label;

                        return (
                          <div
                            key={"category" + index}
                            className={`${
                              navigationItems?.length - 1 == index
                                ? "hidden 3xl:block"
                                : ""
                            } relative flex-shrink-0`}
                          >
                            {hasMenu ? (
                              hasMega ? (
                                <Link
                                  ref={shopAllTriggerRef}
                                  data-nav-button={item.label}
                                  href="/products"
                                  className="relative flex items-center text-gray-700 font-semibold cursor-pointer whitespace-nowrap group"
                                  onMouseEnter={() =>
                                    {
                                      cancelMegaMenuClose();
                                      toggleMegaMenu(item.label, item.categories);
                                    }
                                  }
                                  onMouseLeave={scheduleMegaMenuClose}
                                  onClick={closeMegaMenu}
                                >
                                  <span className="relative">
                                    {item.label}
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-black transition-all duration-300 ease-out group-hover:w-full"></span>
                                  </span>
                                  <ChevronDown className="ms-2 h-5 w-5 shrink-0" />
                                </Link>
                              ) : (
                                <span
                                  data-nav-button={item.label}
                                  className="relative flex items-center text-gray-700 font-semibold cursor-pointer whitespace-nowrap group"
                                  onMouseEnter={() =>
                                    {
                                      cancelMegaMenuClose();
                                      toggleSubMenu(item?.label, item?.subMenu);
                                    }
                                  }
                                  onMouseLeave={scheduleMegaMenuClose}
                                >
                                  <span className="relative">
                                    {item.label}
                                    <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-black transition-all duration-300 ease-out group-hover:w-full"></span>
                                  </span>
                                  <ChevronDown className="ms-2 h-5 w-5 shrink-0" />
                                </span>
                              )
                            ) : (
                              <Link
                                key={item.label}
                                href={item.href}
                                className=" flex items-center text-gray-700 font-semibold whitespace-nowrap group"
                              >
                                <span className="relative">
                                  {item.label}
                                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-black transition-all duration-300 ease-out group-hover:w-full"></span>
                                </span>
                                {item.badge && (
                                  <span className="ml-2 px-2 py-0.5 text-xs bg-teal-500 text-white rounded-full font-semibold whitespace-nowrap">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>
                            )}
                            {isSubMenuOpen && (
                              <SubMenuWrapper
                                itemLabel={item.label}
                                items={subMenuItem}
                                onClose={() => toggleSubMenu()}
                                cancelClose={cancelMegaMenuClose}
                                scheduleClose={scheduleMegaMenuClose}
                              />
                            )}
                          </div>
                        );
                      })}
                    </nav>
                  </div>

                  {/* Center Section - Logo */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 md:static md:translate-x-0 md:translate-y-0 flex justify-center px-2 md:px-4 md:translate-x-1.5 items-center min-w-0 z-[1]">
                    <Link
                      href="/"
                      className="flex items-center justify-center"
                    >
                      <MobileLogo className="md:hidden" />
                      <div className="hidden md:flex items-center justify-center w-full">
                        {!generalSettings?.logoLight ? (
                          <LogoAnimation className="w-auto h-auto max-h-[7vw] sm:max-h-12 sm:max-w-auto" />
                        ) : (
                          <Image
                            src={generalSettings.logoLight}
                            alt={translate("viteezyLogo")}
                            width={160}
                            height={40}
                            className="w-auto h-auto max-h-[7vw] sm:max-h-12 sm:max-w-auto"
                          />
                        )}
                      </div>
                    </Link>
                  </div>

                  {/* Right Section - 40% width */}
                  <div className="flex items-center justify-end sm:space-x-1 xl:space-x-1.5 min-w-0">
                    {/* Membership - hidden when user is member or sub-member */}
                    {!hideMembershipInHeader && (
                      <Link href="/membership" className="hidden lg:flex group">
                        <div className="flex bg-[#efede0] hover:bg-white transition-colors duration-300 cursor-pointer backdrop-blur-sm rounded-full px-2.5 py-2 border border-white/20">
                          <span className="text-black font-saans font-medium mr-2 ml-1">
                            {translateC("membership")}
                          </span>
                          <span className="bg-teal-green-color font-saans text-white text-xs px-2 py-1 rounded-full font-semibold">
                            {translate("Pro")}
                          </span>
                        </div>
                      </Link>
                    )}

                    {/* Language Selector */}
                    <div className="hidden xl:block relative flex-shrink-0">
                      <LanguageDialog />

                      {isLanguageOpen && (
                        <div className="absolute  right-0 mt-2 w-32 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                          {languages.map((lang) => (
                            <button
                              key={lang.code}
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => setIsLanguageOpen(false)}
                            >
                              <LanguageFlagIcon
                                langCode={lang.code}
                                size={24}
                              />
                              <span className="truncate">{lang.label}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* User Profile */}
                    <div
                      ref={isLoggedIn ? userMenuRef : null}
                      className="relative hidden xl:block flex-shrink-0 flex pb-5 -mb-5"
                      onMouseEnter={handleUserMenuHover}
                      onMouseLeave={handleUserMenuLeave}
                    >
                      {isLoggedIn ? (
                        <>
                          <button
                            className="w-9 h-9 rounded-full cursor-pointer hover:opacity-90 transition-opacity duration-300 shrink-0 border border-[#e8e0c8] bg-pastel-yellow-color flex items-center justify-center overflow-hidden"
                            aria-label={translateC("userMenuAria")}
                          >
                            {userProfileImageUrl ? (
                              <img
                                src={userProfileImageUrl}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="font-semibold text-base leading-none text-gray-900">
                                {userFirstLetter}
                              </span>
                            )}
                          </button>

                          <div
                            className={`${
                              isUserMenuOpen
                                ? "opacity-100 "
                                : "opacity-0 invisible"
                            } absolute overflow-hidden left-1/2 -translate-x-1/2 mt-2 w-48 3xl:w-55 bg-white rounded-xl shadow-lg border border-extra-light-color py-1 z-50 transition-all duration-200 `}
                          >
                            <span className="block px-5 pt-3.5 pb-2 text-xs text-dim-gray/60 uppercase font-medium tracking-wide">
                              {translate("account")}
                            </span>
                            <Link
                              href={routes.account}
                              className="block px-5 py-2 text-sm 3xl:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              {translate("MyProfile")}
                            </Link>
                            <Link
                              href="/account?tab=orders"
                              className="block px-5 py-2 text-sm 3xl:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              {translate("orderHistory")}
                            </Link>
                            <Link
                              href={routes.favorites}
                              className="block px-5 py-2 text-sm 3xl:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              {translate("wishlist")}
                            </Link>
                            <Link
                              href="/settings?tab=subscribe"
                              className="block px-5 py-2 text-sm 3xl:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              {tAccount("subscriptions")}
                            </Link>
                            <Link
                              href="/settings?tab=membership"
                              className="block px-5 py-2 text-sm 3xl:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              {translateC("membership")}
                            </Link>
                            <Link
                              href="/settings?tab=change-password"
                              className="block px-5 py-2 text-sm 3xl:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              {translate("Settings")}
                            </Link>
                            <hr className="my-1.5" />
                            <button
                              className="flex gap-4 items-center disabled:opacity-50 w-full text-start px-5 py-2.5 text-sm 3xl:text-base font-medium text-gray-700 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                              onClick={logout}
                              disabled={isLoggingOut}
                            >
                              {isLoggingOut && <Spinner size="xs" />}{" "}
                              {translateC("logOut")}
                            </button>
                          </div>
                        </>
                      ) : (
                        <Link
                          href="/login"
                          className="flex items-center py-1 space-x-1 px-1.5 rounded-full hover:bg-white transition-colors duration-300 cursor-pointer"
                        >
                          <div className="w-8 h-8 bg-linear-to-r rounded-full flex items-center justify-center flex-shrink-0">
                            <UserRound className="h-5.5 w-5.5 flex-shrink-0" />
                          </div>
                          <span className="hidden lg:block font-semibold text-gray-700 whitespace-nowrap pe-1.5">
                            {translate("LogIn")}
                          </span>
                        </Link>
                      )}
                    </div>

                    {/* Search */}
                    <button
                      onClick={() => {
                        setIsSearchOpen((pre) => !pre);
                        closeMegaMenu();
                      }}
                      className="p-2 rounded-full cursor-pointer hover:bg-white transition-colors duration-300 flex-shrink-0"
                      aria-label={translateC("searchAria")}
                    >
                      <Search className="h-5.5 w-5.5 text-gray-600" />
                    </button>

                    {/* Cart */}
                    <button
                      type="button"
                      onMouseEnter={prefetchHeavyQueries}
                      onClick={openCart}
                      className="relative p-2 rounded-full cursor-pointer hover:bg-white transition-colors duration-300 flex-shrink-0"
                      aria-label={translateC("shoppingCartAria")}
                    >
                      <Handbag className="h-5.5 w-5.5 text-gray-600" />
                      {/* Cart Badge */}
                      {cartCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-teal-500 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {cartCount}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <div className="hidden lg:block">
            <MegaMenuDropdown
              isShow={Boolean(selectedNav == translate("ShopAll"))}
              onClose={closeMegaMenu}
              panelRef={megaMenuPanelRef}
              onPanelMouseEnter={cancelMegaMenuClose}
              onPanelMouseLeave={scheduleMegaMenuClose}
            />
          </div>
        </div>
        <Backdrop
          isOpen={Boolean(selectedNav == translate("ShopAll"))}
          onClose={closeMegaMenu}
          zIndex={-20}
          closeOnHover
        />

        {/* Side Menu */}
        <SideMenu
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          navigationItems={[
            ...navigationItems,
            ...(!hideMembershipInHeader
              ? [
                  {
                    label: translateC("membership"),
                    href: "/membership",
                  },
                ]
              : []),
          ]}
        />

        <SearchMenu
          isShow={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
      </div>
    </FixedPortal>
  );
};

export default Header;
