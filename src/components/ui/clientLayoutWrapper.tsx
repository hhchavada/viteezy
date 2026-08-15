"use client";

import { useState, useEffect, useLayoutEffect } from "react";
import SplashScreen from "./splashScreen";
import { Toaster } from "react-hot-toast";
import { usePathname } from "next/navigation";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({
  children,
}: ClientLayoutWrapperProps) {
  const [splashDismissed, setSplashDismissed] = useState(false);
  const pathname = usePathname();

  useLayoutEffect(() => {
    if (sessionStorage.getItem("splashShown") === "true") {
      setSplashDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (pathname?.startsWith("/static-pages")) {
      setSplashDismissed(true);
      sessionStorage.setItem("splashShown", "true");
    }
  }, [pathname]);

  const handleSplashComplete = () => {
    setSplashDismissed(true);
    sessionStorage.setItem("splashShown", "true");
  };

  return (
    <>
      {children}
      <Toaster position="top-right" />
      {!splashDismissed && (
        <SplashScreen onComplete={handleSplashComplete} />
      )}
    </>
  );
}
