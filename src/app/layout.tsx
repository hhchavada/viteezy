import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import type { Metadata } from "next";
import "./globals.css";
import { cardinalFont, saansFont } from "./fonts";
import ScrollSmootherComponent from "@/components/ui/scrollSmootherComponent";
import AOSWrapper from "@/components/ui/aosWrapper";
import PageContentWrapper from "@/components/ui/pageContentWrapper";
import ScrollToTopOnRouteChange from "@/components/ui/scrollToTopOnRouteChange";
import { CartSidebarProvider } from "@/lib/cartSidebar";
import { SubscriptionSidebarProvider } from "@/lib/subscriptionSidebar";
import StoreProvider from "@/store/storeProvider";
import { LandingHeavyQueryGateProvider } from "@/contexts/LandingHeavyQueryGate";
import ClientLayoutWrapper from "@/components/ui/clientLayoutWrapper";
import MaintenanceGate from "@/components/MaintenanceGate";
import React from "react";
import CartSidebar from "@/components/ui/cartSidebar";
import SubscriptionCartSidebar from "@/components/ui/subscriptionCartSidebar";
import KlaviyoScript from "@/components/KlaviyoScript";
import Script from "next/script";

export const metadata: Metadata = {
  title: "Viteezy - Personalized Vitamins",
  description:
    "Personalized vitamins, especially for your intestines. Join 400,000+ people who have already received their recommendation.",
  icons: {
    icon: "/favicon.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) || "en";
  const messages = (await getMessages()) || { locale: "en" };
  return (
    <html lang={locale}>
      <head>
        <Script
          id="cookieyes"
          src="https://cdn-cookieyes.com/client_data/e45f772e0a917fd036ee2f9ef7f5ac6e/script.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={`${cardinalFont.variable} ${saansFont.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <StoreProvider>
            <MaintenanceGate>
              <KlaviyoScript />
              <ClientLayoutWrapper>
                <CartSidebarProvider>
                  <LandingHeavyQueryGateProvider>
                    <SubscriptionSidebarProvider>
                      <ScrollSmootherComponent />
                      <ScrollToTopOnRouteChange />
                      <AOSWrapper>
                        {/* <Header /> */}
                        <div id="smooth-wrapper">
                          <div id="smooth-content" className="">
                            <PageContentWrapper>
                              <main>{children}</main>
                              {/* <Footer /> */}
                            </PageContentWrapper>
                          </div>
                        </div>
                      </AOSWrapper>
                      <CartSidebar />
                      <SubscriptionCartSidebar />
                    </SubscriptionSidebarProvider>
                  </LandingHeavyQueryGateProvider>
                </CartSidebarProvider>
              </ClientLayoutWrapper>
            </MaintenanceGate>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
