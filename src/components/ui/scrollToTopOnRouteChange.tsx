"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { scrollToTop } from "@/lib/scrollToTop";

/**
 * Component that automatically scrolls to top when route changes
 * This should be added to the layout to work globally across all pages
 */
export default function ScrollToTopOnRouteChange() {
  const pathname = usePathname();

  useEffect(() => {
    // Scroll to top whenever pathname changes
    scrollToTop();
  }, [pathname]);

  return null;
}
