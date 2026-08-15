"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";

const KLAVIYO_EXCLUDE_PATHS = [
  "/static-pages",
  "/faq",
  "/contactUs",
  "/aboutUs",
];

function shouldLoadKlaviyo(pathname: string | null): boolean {
  if (!pathname) return true;
  return !KLAVIYO_EXCLUDE_PATHS.some((base) =>
    pathname === base || pathname.startsWith(`${base}/`)
  );
}

export default function KlaviyoScript() {
  const pathname = usePathname();
  const load = shouldLoadKlaviyo(pathname);

  if (!load) return null;

  return (
    <Script
      async
      strategy="afterInteractive"
      src="https://static.klaviyo.com/onsite/js/klaviyo.js?company_id=VMhqn7"
    />
  );
}
