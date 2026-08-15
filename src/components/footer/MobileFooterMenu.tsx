"use client";

import React, { useState } from "react";
import {
  navigationData as defaultNavigationData,
  paymentMethods,
} from "../constants/footer";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { SocialIcon } from "@/components/icons";
import type { SocialLinkItem } from "@/lib/generalSettings";
import Image from "next/image";
import { Language } from "../constants/countries";

interface FooterMenuProps {
  className?: string;
  navigationData?: typeof defaultNavigationData;
  langs?: Language[];
  langValue?: string;
  onLangChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  socialLinks?: SocialLinkItem[];
  isLoadingSocial?: boolean;
}

const Plus = ({
  className,
  isOpen,
}: {
  className?: string;
  isOpen?: boolean;
}) => (
  <svg
    className={`${className} transition-transform duration-300 ease-in-out ${
      isOpen ? "rotate-45" : "rotate-0"
    }`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);

const MobileFooterMenu = ({
  className = "",
  navigationData = defaultNavigationData,
  langs,
  langValue,
  onLangChange,
  socialLinks = [],
  isLoadingSocial = false,
}: FooterMenuProps) => {
  const [openSection, setOpenSection] = useState<string | null>(null);
  const t = useTranslations("Footer");

  const toggleSection = (title: string) => {
    setOpenSection((prev) => (prev === title ? null : title));
  };
  return (
    <div className={`${className}  block md:hidden text-white `}>
      <div className="my-9">
        {navigationData.map((section, idx) => {
          const isOpen = openSection === section.title;
          return (
            <div
              data-aos="fade-right"
              data-aos-delay={idx * 200}
              key={section.title}
              className={`overflow-hidden border-t ${
                idx + 1 == navigationData?.length ? "border-b" : ""
              } border-white/20 `}
            >
              <button
                onClick={() => toggleSection(section.title)}
                className={`w-full text-left  hover:bg-white/5 transition-all duration-300 py-3`}
                aria-expanded={isOpen}
              >
                <div className="px-2 flex items-center justify-between">
                  <h3 className="font-saans font-semibold text-lg">
                    {section.title}
                  </h3>
                  <Plus className="w-7 h-7 text-white" isOpen={isOpen} />
                </div>
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  isOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
                }`}
              >
                <ul className="px-4 pb-4 space-y-2.5">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="font-saans text-base text-white/90 hover:text-white transition-colors duration-200 flex items-center gap-2 font-medium"
                      >
                        {link.label}
                        {"badge" in link && link.badge && (
                          <span className="bg-orange-200 text-black text-[10px] px-2 py-0.5 rounded-full font-medium">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                  {(section as { hasLanguageSelector?: boolean }).hasLanguageSelector && (
                    <li className="mt-2">
                      <div className="flex items-center gap-2 font-saans text-sm text-white/90">
                        {/* <Globe className="w-4 h-4" /> */}
                        <select
                          value={langValue}
                          onChange={onLangChange && onLangChange}
                          className="bg-transparent border-none text-white/90 hover:text-white cursor-pointer focus:outline-none appearance-none"
                        >
                          {langs?.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                              {lang.flag}&nbsp;&nbsp;{lang.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        {/* Follow Us - Mobile (only when we have links from general settings) */}
        {(isLoadingSocial || socialLinks.length > 0) && (
          <div className="">
            <h3 className="font-saans font-semibold text-base mb-4">
              {t("followUs")}
            </h3>
            <div className="flex flex-wrap gap-4">
              {isLoadingSocial ? (
                <div className="flex gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded bg-white/20 animate-pulse"
                      aria-hidden
                    />
                  ))}
                </div>
              ) : (
                socialLinks.map((social) => (
                  <Link
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white/90 hover:text-white transition-colors duration-200"
                    aria-label={social.name}
                  >
                    <SocialIcon name={social.name} />
                  </Link>
                ))
              )}
            </div>
          </div>
        )}

        {/* {t("securePayment")} Section */}
        <div className="mt-9 md:mt-12">
          <h3 className="font-saans font-medium text-lg mb-4 text-white">
            {t("securePayment")}
          </h3>
          <div className="flex flex-wrap gap-3 items-center">
            {paymentMethods.map((method) => (
              <div key={method.name} className="rounded">
                {/* <span className="text-xs md:text-sm text-white/80 font-medium">
                    {method.name}
                  </span> */}
                <Image
                  height={28}
                  width={44}
                  src={method?.img}
                  alt={method?.name}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileFooterMenu;
