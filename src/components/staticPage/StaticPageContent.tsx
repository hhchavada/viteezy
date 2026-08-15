"use client";

import React from "react";
import { useLocale } from "next-intl";
import { useGetStaticPageQuery } from "@/store/api/staticPagesApi";
import Spinner from "@/components/ui/spinner";
import Link from "next/link";

interface StaticPageContentProps {
  slug: string;
}

export default function StaticPageContent({ slug }: StaticPageContentProps) {
  const locale = useLocale();
  const { data, isLoading, isError } = useGetStaticPageQuery({ slug, lang: locale });
  const page = data?.data?.page;

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Page not found
        </h1>
        <p className="text-gray-600 mb-6">
          We couldn’t load this page. It may have been moved or doesn’t exist.
        </p>
        <Link
          href="/"
          className="text-teal-600 hover:text-teal-700 font-medium underline"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <header className="">
        <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-bold text-black-color font-saans">
          {page.title}
        </h1>
      </header>
      <hr className="border-gray-300 my-6 md:my-9" />
      <div
        className="static-page-content prose prose-lg max-w-none font-saans text-charcol-color prose-headings:font-semibold prose-headings:text-black-color prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </article>
  );
}
