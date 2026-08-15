"use client";
import React from "react";
import Link from "next/link";
import { BreadcrumbRightSide } from "../icons";
import { useTranslations } from "next-intl";

interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface BannerProps {
  backgroundImage: string;
  breadcrumbs: BreadcrumbItem[];
  title: string;
  description: string;
}

export default function Banner({
  backgroundImage,
  breadcrumbs,
  title,
  description,
}: BannerProps) {
  return (
    <div className="section-padding overflow-hidden relative">
      {/* Note: bg-right makes the browser align the background image to the right (showing the 'last' part).
          Responsive heights help the image look better on different screens. */}
      <div
        className="relative bg-cover bg-right bg-no-repeat radius-style h-72 3xl:h-75"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="relative w-section mx-auto z-10 md:py-10 3xl:py-12 md:pr-16 flex flex-col h-full gap-5">
          <nav className="sub-heading-style text-white md:text-black-color">
            <ol className="hidden md:inline-flex items-center justify-center space-x-2">
              {breadcrumbs.map((item, index) => (
                <div key={index} className=" flex items-center space-x-2">
                  <li
                    className={`font-saans 3xl:text-lg ${item.isActive
                        ? "text-light-gray-color"
                        : "text-white md:text-black-color"
                      } ${item.href && !item.isActive ? "cursor-pointer hover:underline" : ""}`}
                  >
                    {item.href && !item.isActive ? (
                      <Link href={item.href}>{item.label}</Link>
                    ) : (
                      item.label
                    )}
                  </li>
                  {index < breadcrumbs.length - 1 && (
                    <li className="text-white md:text-black-color 3xl:text-lg">
                      <BreadcrumbRightSide />
                    </li>
                  )}
                </div>
              ))}
            </ol>
          </nav>

          <h1 className="text-4xl md:text-3xl 3xl:text-[39px] font-medium text-white md:text-black-color font-saans 3xl:mb-">
            {title}
          </h1>

          <p className="text-white md:text-light-gray-color sub-heading-style max-w-xl">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}
