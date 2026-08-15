"use client";

import React from "react";
import { FaqViewProvider, useFaqView } from "@/lib/faqViewContext";
import Banner from "@/components/faq/Banner";
import MainLayout from "@/components/layouts/MainLayout";

function FAQContent({ children }: { children: React.ReactNode }) {
  const { setSearchQuery } = useFaqView();

  return (
    <MainLayout>
      <section className="min-h-screen pb-0 md:pb-20">
        <Banner onSearch={setSearchQuery} />
        <div className="max-w-[1150px] mx-auto px-4">{children}</div>
      </section>
    </MainLayout>
  );
}

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return (
    <FaqViewProvider>
      <FAQContent>{children}</FAQContent>
    </FaqViewProvider>
  );
}
