"use client";

import React, { useMemo } from "react";
import Header from "../header";
import Footer from "../footer";
import PageContentWrapper from "../ui/pageContentWrapper";
import SimpleHeader from "../header/SimpleHeader";
import { useGetHeaderBannerQuery, headerBannerApi } from "@/store/api/headerBannerApi";
import { useTranslations, useLocale } from "next-intl";
import { useAppSelector } from "@/store";
import { useScrollAtTop } from "@/hooks/useScrollAtTop";
import { useIsMobile } from "@/hooks/useIsMobile";
import { cn } from "@/lib/utils";

const MainLayout = ({
  children,
  isFooter = true,
  headerClassName = "",
  simpleHeader = false,
}: {
  children: React.ReactNode;
  isFooter?: boolean;
  headerClassName?: string;
  simpleHeader?: boolean;
}) => {
  const translate = useTranslations("Header");
  const locale = useLocale();
  const bannerParams = useMemo(
    () => ({ deviceType: "WEB" as const, lang: locale }),
    [locale]
  );

  const headerBannerFromHeader = useAppSelector((state) =>
    headerBannerApi.endpoints.getHeaderBanner.select(bannerParams)(state)
  );

  const { data: headerBannerFromLayout } = useGetHeaderBannerQuery(
    bannerParams,
    { skip: !simpleHeader }
  );

  const headerBannerData = simpleHeader
    ? headerBannerFromLayout
    : headerBannerFromHeader.data;
  
  const headerBanner = headerBannerData?.data?.headerBanner;
  const showHeaderBanner = Boolean(
    headerBanner?.isActive && headerBanner?.text?.trim()
  );
  
  const topOfferText = showHeaderBanner
    ? headerBanner!.text
    : translate("topBanner");
    
  const shouldShowBanner = showHeaderBanner || topOfferText !== translate("topBanner");

  const isAtTop = useScrollAtTop();
  const isMobile = useIsMobile();
  const hideBannerOnScroll = isMobile && !isAtTop;

  const contentPadding = shouldShowBanner
    ? hideBannerOnScroll
      ? "pt-[56px] md:pt-[124px] 3xl:pt-[133px]"
      : "pt-[88px] md:pt-[124px] 3xl:pt-[133px]"
    : "pt-[56px] md:pt-[80px] 3xl:pt-[88px]";

  return (
    <>
      {simpleHeader ? <SimpleHeader className={headerClassName} /> : <Header className={headerClassName} />}
      <div className={cn(contentPadding, "transition-[padding-top] duration-300 ease-in-out")}>
        <PageContentWrapper>
          <main>{children}</main>
        </PageContentWrapper>
        {isFooter && <Footer />}
      </div>
    </>
  );
};

export default MainLayout;
