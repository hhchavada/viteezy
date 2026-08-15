import React from "react";
import MainLayout from "@/components/layouts/MainLayout";
import StaticPageContent from "@/components/staticPage/StaticPageContent";

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <MainLayout headerClassName="border-b border-[#e9e8d7]">
      <div className="bg-off-white-color min-h-screen">
        <StaticPageContent slug={slug} />
      </div>
    </MainLayout>
  );
}
