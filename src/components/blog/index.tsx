"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useDragScroll } from "@/hooks/useDragScroll";
import Image from "next/image";
import Link from "next/link";
import Pagination from "../pagination";
import Banner from "../ui/banner";
import {
  useGetBlogsQuery,
  useGetBlogCategoriesQuery,
  useGetPopularBlogsQuery,
} from "@/store/api/blogApi";
import FallbackImage from "../ui/fallbackImage";
import { useLocale, useTranslations } from "next-intl";

export default function BlogPage() {
  const heroImageSrc = "/products/productHeroBanner.png";
  const [active, setActive] = useState("All");
  const [page, setPage] = useState(1);

  const {
    scrollContainerRef,
    isDragging,
    handleMouseDown,
    handleMouseLeave,
    handleMouseUp,
    handleMouseMove,
  } = useDragScroll();

  const locale = useLocale();
  const tBlog = useTranslations("Blog");
  const tCommon = useTranslations("Common");
  const tProducts = useTranslations("Products");

  // Fetch blog categories
  const { data: categoriesData, isLoading: categoriesLoading } =
    useGetBlogCategoriesQuery();

  // Fetch category and page
  const { data: blogsData, isLoading: blogsLoading } = useGetBlogsQuery({
    category: active !== "All" ? active : undefined,
    page,
    limit: 10,
  });

  // Fetch trending blogs
  const { data: popularBlogsData, isLoading: popularBlogsLoading } =
    useGetPopularBlogsQuery();

  const categories = (categoriesData?.data?.categories || []).filter(
    (cat) => cat.blogCount > 0
  );
  const blogs = Array.isArray(blogsData?.data?.blogs) ? blogsData.data.blogs : [];
  const blogBanners = Array.isArray(blogsData?.data?.blogBanners) ? blogsData.data.blogBanners : [];
  const pagination = blogsData?.pagination;
  const trendingBlogs = Array.isArray(popularBlogsData?.data?.blogs)
    ? popularBlogsData.data.blogs
    : [];

  // Create tabs array with "All" first, then categories that have blogs
  const tabs = ["All", ...categories.map((cat) => cat.title)];

  useEffect(() => {
    if (active !== "All" && !categories.some((cat) => cat.title === active)) {
      setActive("All");
      setPage(1);
    }
  }, [categories, active]);

  const breadcrumbs = [
    { label: tCommon("home"), href: "/" },
    { label: tBlog("blog"), isActive: true },
  ];
  return (
    <section className="min-h-screen bg-white">
      <Banner
        backgroundImage={blogBanners[0]?.banner_image?.url || heroImageSrc}
        breadcrumbs={breadcrumbs}
        title={blogBanners[0]?.heading || tBlog("pageTitle")}
        description={
          blogBanners[0]?.description || tBlog("pageDescription")
        }
      />

      <div className="mx-auto w-section py-10">
        <div className="flex flex-col lg:flex-row">
          <section
            className="3xl:min-h-140 relative flex-1 basis-4/5 3xl:basis-1 overflow-hidden rounded-3xl bg-cover bg-center px-6 pt-4 pb-44  md:py-24 lg:py-16 sm:px-10 flex flex-col justify-between items-start"
            style={{
              backgroundImage: trendingBlogs[0]?.coverImage
                ? `url('${trendingBlogs[0].coverImage}')`
                : "url('/blog/bgBaner.png')",
            }}
          >
            {/* subtle overlay */}
            <div className="pointer-events-none absolute inset-0 bg-black/5" />

            {/* content */}
            <div className="relative z-10 flex flex-col items-start justify-center h-full">
              <p className="text-sm font-extralight text-white 3xl:text-lg">
                {trendingBlogs[0]?.category?.title || tBlog("blog")}{" "}
                <span className="mx-2">|</span>{" "}
                {trendingBlogs[0]?.createdAt
                  ? new Date(trendingBlogs[0].createdAt).toLocaleDateString(
                    locale,
                    {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }
                  )
                  : ""}
              </p>

              <h1 className="mt-4 max-w-lg md:max-w-md text-left text-4xl  tracking-tight text-white sm:text-3xl 3xl:text-[35px]">
                {trendingBlogs[0]?.title || tBlog("heroTitle")}
              </h1>

              <Link href={`/blog/${trendingBlogs[0]?._id || "1"}`}>
                <button className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm 3xl:text-lg font-medium cursor-pointer text-neutral-900 shadow-sm transition hover:bg-neutral-100">
                  {tCommon("learnMore")}
                </button>
              </Link>
            </div>
          </section>

          {/* RIGHT 40% – Trending */}
          <aside className="flex-1 basis-2/5 3xl:basis-12/5 lg:max-w-md 3xl:max-w-lg py-5 lg:py-0">
            <div className="rounded-3xl md:px-6">
              <h2 className="text-lg font-medium text-neutral-900 pt-6 pb-3 md:pb-0 md:pt-0 3xl:text-[21px]">
                {tBlog("trending")}
              </h2>

              {/* Scroll area – will scroll naturally when items > max height */}
              <div className="lg:h-100 overflow-y-auto pr-2 hide-scrollbar">
                {popularBlogsLoading ? (
                  <div className="py-4 text-sm text-gray-500">{tCommon("loading")}</div>
                ) : trendingBlogs.length === 0 ? (
                  <div className="py-4 text-sm text-gray-500">
                    {tBlog("noTrendingBlogs")}
                  </div>
                ) : (
                  trendingBlogs.map((item: any) => (
                    <div key={item._id}>
                      <Link href={`/blog/${item._id}`}>
                        <article className="flex gap-4 py-3.5 transition-transform duration-200 hover:translate-x-2">
                          <div className="relative h-20 3xl:h-25 w-20 3xl:w-25 shrink-0 overflow-hidden rounded-2xl">
                            <FallbackImage
                              src={item.coverImage}
                              alt={item.title}
                              fill
                              className="object-cover"
                              // unoptimized
                            />
                          </div>

                          <div className="flex flex-1 flex-col justify-between">
                            <h3 className="text-base font-medium text-neutral-900 leading-snug 3xl:text-[21px]">
                              {item.title}
                            </h3>
                            <div className="mt-1 text-sm  3xl:text-lg">
                              <span>{item.category?.title}</span>
                              <span className="mx-2">|</span>
                              <span>
                                {new Date(item.createdAt).toLocaleDateString(
                                  locale,
                                  {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  }
                                )}
                              </span>
                            </div>
                          </div>
                        </article>
                      </Link>
                      <div className="h-px bg-extra-light-gray w-full 3xl:my-1.5" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
        <div
          ref={scrollContainerRef}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          className={`flex space-x-3 my-8 overflow-x-auto hide-scrollbar ${isDragging ? "cursor-grabbing" : "cursor-grab"
            }`}
          style={{ userSelect: isDragging ? "none" : "auto" }}
        >
          {categoriesLoading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              {tBlog("loadingCategories")}
            </div>
          ) : (
            tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`px-4 py-2 cursor-pointer rounded-full text-sm 3xl:text-lg font-medium transition-all whitespace-nowrap shrink-0
            ${active === tab
                    ? "bg-teal-500 text-white shadow-sm border border-teal-500"
                    : "bg-slate-50-color text-gray-800 border border-slate-50-color hover:border hover:border-gray-300"
                  }`}
              >
                {tab === "All" ? tProducts("all") : tab}
              </button>
            ))
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 w-full mx-auto gap-6 mb-16">
          {blogsLoading ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              {tBlog("loadingBlogs")}
            </div>
          ) : blogs.length === 0 ? (
            <div className="col-span-full text-center py-10 text-gray-500">
              {tBlog("noBlogsFound")}
            </div>
          ) : (
            blogs.map((blog: any, index: number) => {
              return (
                <Link href={`/blog/${blog._id}`} key={blog._id}>
                  <Card
                    data-aos="fade-up"
                    data-aos-delay={index * 200}
                    className="overflow-hidden transition-shadow duration-300 border-0 shadow-none py-0 rounded-none bg-transparent h-full cursor-pointer hover:opacity-90"
                  >
                    <div className="aspect-6/4 overflow-hidden radius-style">
                      <Image
                        width={478}
                        height={284}
                        src={blog.coverImage || "https://png.pngtree.com/png-vector/20221125/ourmid/pngtree-no-image-available-icon-flatvector-illustration-blank-avatar-modern-vector-png-image_40962406.jpg"}
                        alt={blog.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        // unoptimized
                      />
                    </div>
                    <CardContent className="p-2 gap-3 flex flex-col">
                      <div className="flex items-center gap-2 text-sm 3xl:text-lg font-saans text-black-color">
                        <span>{blog.category.title}</span>
                        <span>|</span>
                        <span>
                          {new Date(blog.createdAt).toLocaleDateString(
                            locale,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                      <h3 className="text-2xl 3xl:text-[28px] font-saans font-medium text-black-color line-clamp-2">
                        {blog.title}
                      </h3>
                      <div
                        className="text-black-color sub-heading-style text-base 3xl:text-[21px] line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: blog.description }}
                      />
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
        {pagination && pagination.pages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={pagination.pages}
            onPageChange={setPage}
          />
        )}
      </div>
    </section>
  );
}
