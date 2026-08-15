"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
  isActive?: boolean;
}

interface FAQBreadcrumbProps {
  items: BreadcrumbItem[];
}

const FAQBreadcrumb: React.FC<FAQBreadcrumbProps> = ({ items }) => {
  return (
    <nav className="flex items-center gap-2 text-base mb-6 text-nowrap flex-wrap">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <span className="text-gray-500">
              <ChevronRight />
            </span>
          )}
          {item.href ? (
            <Link
              href={item.href}
              aria-current={item.isActive ? "page" : undefined}
              className={`${
                item.isActive ? "text-gray-400" : "text-black"
              } font-medium truncate hover:text-gray-900 transition-colors`}
            >
              {item.label}
            </Link>
          ) : (
            <span
              className={`${
                item.isActive ? "text-gray-400" : "text-black"
              } font-medium truncate`}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default FAQBreadcrumb;
