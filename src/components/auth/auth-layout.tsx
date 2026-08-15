"use client";
import { usePathname, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import MainLayout from "../layouts/MainLayout";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoaded, setIsLoaded] = React.useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("accessToken")
          : null;
      if (!!token) router.push("/");
      else setIsLoaded(true);
    };

    checkAuth();
    // Check auth on storage change (for logout/login from other tabs)
    window.addEventListener("storage", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
    };
  }, [pathname]);
  return (
    isLoaded && (
      <MainLayout headerClassName="border-b border-slate-border-color">
        {" "}
        {children}{" "}
      </MainLayout>
    )
  );
}
