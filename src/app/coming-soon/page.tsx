"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import MainLayout from "@/components/layouts/MainLayout";
import Image from "next/image";
import { Button } from "@/components/ui";

export default function ComingSoonPage() {
  const t = useTranslations("Common");
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <MainLayout headerClassName="border-b border-[#e9e8d7]">
      <div
        className="relative min-h-screen flex items-center justify-center bg-cover  bg-no-repeat overflow-hidden z-2"
        style={{
          backgroundImage: "url('/comingSoonFogg.webp')",
          backgroundPosition: "center -150px",
        }}
      >
        {/* Fog Overlay */}
        <div
          className="pointer-events-none absolute inset-0 bg-contain top-0 xl:bg-cover bg-top bg-no-repeat -z-1 opacity-80"
          style={{ backgroundImage: "url('/comingSoonBg.webp')" }}
        />
        <div className="text-center px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <Image
              width={80}
              height={80}
              alt="coming-soon-clock"
              src="/clock.webp"
              className="mx-auto mb-9.5"
            />
            <h1 className="text-2xl md:text-[28px] font-bold text-gray-800 mb-2.5">
              {t("comingSoonTitle")}
            </h1>
            <p className="text-base md:text-lg text-gray-500 mb-12 leading-tight">
              {t("comingSoonDescription")}
            </p>
            <div className="flex justify-center">
              <Button
                type="button"
                variant="elevate"
                size="elevate"
                onClick={handleGoBack}
                animateText
              >
                {t("comingSoonGoBack")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
