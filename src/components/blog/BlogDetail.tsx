"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useGetBlogByIdQuery, useGetPopularBlogsQuery, useGetBlogsQuery } from "@/store/api/blogApi";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { formatDate, sanitizeHtml } from "@/lib/utils";
import FallbackImage from "../ui/fallbackImage";

export default function BlogDetailPage() {
  const params = useParams();
  const blogId = params?.id as string;

  const locale = useLocale();
  const t = useTranslations("Blog");
  const tCommon = useTranslations("Common");

  // Fetch blog detail by ID
  const { data: blogDetail, isLoading, error } = useGetBlogByIdQuery(blogId);

  // Fetch trending blogs for sidebar
  const { data: popularBlogsData } = useGetPopularBlogsQuery();

  // Fetch related blogs (from same category or general blogs)
  const { data: relatedBlogsData } = useGetBlogsQuery({
    category: blogDetail?.data?.blog?.category?.title,
    limit: 6,
  });

  const blog = blogDetail?.data?.blog;
  const trendingBlogs = popularBlogsData?.data?.blogs || [];
  const relatedBlogs = (relatedBlogsData?.data?.blogs || []).filter(
    (item) => item._id !== blogId
  );
  const showRelatedNav = relatedBlogs.length > 3;

  const title = blog?.title ?? "";
  const categoryTitle = blog?.category?.title ?? "";
  const createdDate = formatDate(blog?.createdAt, locale);
  const imageSrc = blog?.coverImage ?? "";
  const contentHtml = blog?.description ?? "";

  if (isLoading) {
    return (
      <section className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
          <div className="text-center text-gray-500">{tCommon("loading")}</div>
        </div>
      </section>
    );
  }

  if (error || !blog) {
    return (
      <section className="min-h-screen bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8 py-20">
          <div className="text-center text-gray-500">{t("blogNotFound")}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-white">
      {/* Breadcrumb Navigation */}
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex flex-col gap-5 my-9 mt-12">
          <nav className="hidden md:flex items-center gap-2 text-sm 3xl:text-lg">
            <Link
              href="/"
              className="text-charcol-color transition hover:text-neutral-900"
            >
              {tCommon("home")}
            </Link>
            <ChevronRight className="h-4 w-4 text-charcol-color" />
            <Link
              href="/blog"
              className="text-charcol-color transition hover:text-neutral-900"
            >
              {t("blog")}
            </Link>
            <ChevronRight className="h-4 w-4 text-charcol-color" />
            <span className="text-light-gray-color line-clamp-1">{title}</span>
          </nav>

          {/* Article Header */}
          <h1 className="text-4xl font-medium tracking-tight text-black-color sm:text-2xl lg:text-3xl max-w-3xl 3xl:text-[39px]">
            {title}
          </h1>

          <div className="flex items-center gap-2 text-sm 3xl:text-lg text-charcol-color">
            <span>{categoryTitle}</span>
            <span className="text-neutral-400">|</span>
            <span>{createdDate}</span>
          </div>
        </div>

        {/* Hero Image */}
        <div className="relative aspect-video max-h-[500px] w-full overflow-hidden rounded-2xl bg-neutral-100 mb-5 md:mb-12">
          {imageSrc ? (
            <FallbackImage
              src={imageSrc}
              alt={title}
              fill
              className="object-cover"
              // unoptimized
            />
          ) : <FallbackImage
            src={"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQztVSv1wrr_Y2_8WQdaio4Vj0nffHYOcAaig&s"}
            alt={title}
            fill
            className="object-cover"
            // unoptimized
          />}
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Article Content - Left Side - Dynamic HTML */}
          <article className="flex-1 lg:max-w-3xl">
            <div
              className="blog-content"
              dangerouslySetInnerHTML={{ __html: sanitizeHtml(contentHtml) }}
            />
          </article>

          {/* Trending Sidebar - Right Side */}
          <aside className="lg:w-80 shrink-0">
            <h2 className="text-lg font-medium text-neutral-900 mb-4 3xl:text-[21px]">
              {t("trending")}
            </h2>
            <div className="sticky top-8">
              <div className="space-y-4">
                {trendingBlogs.length === 0 ? (
                  <div className="py-4 text-sm text-gray-500">
                    {t("noTrendingBlogs")}
                  </div>
                ) : (
                  trendingBlogs.map((item) => (
                    <div key={item._id} className="mb-0">
                      <Link href={`/blog/${item._id}`}>
                        <article className="flex gap-4 py-3.5 transition-transform duration-200 hover:translate-x-2">
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg">
                            <FallbackImage
                              src={item.coverImage}
                              alt={item.title}
                              fill
                              className="object-cover"
                              // unoptimized
                            />
                          </div>

                          <div className="flex flex-1 flex-col justify-between">
                            <h3 className="text-base 3xl:text-[21px] font-medium text-neutral-900 leading-snug line-clamp-2">
                              {item.title}
                            </h3>
                            <div className="mt-1 text-sm 3xl:text-lg font-light text-charcol-color">
                              <span>{item.category?.title}</span>
                              <span className="mx-1">|</span>
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
                      <div className="h-px bg-extra-light-gray w-full" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Related Articles */}
      <section className="section-py bg-white">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <h2 className="text-2xl 3xl:text-[28px] font-medium text-black-color mb-8">
            {t("relatedPosts")}
          </h2>

          {relatedBlogs.length === 0 ? (
            <div className="w-full text-center py-10 text-gray-500">
              {t("noRelatedArticlesFound")}
            </div>
          ) : showRelatedNav ? (
            <div className="relative px-0 xl:px-16">
              <Carousel
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {relatedBlogs.map((relatedBlog, index) => (
                    <CarouselItem
                      key={relatedBlog._id}
                      className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
                    >
                      <Link href={`/blog/${relatedBlog._id}`}>
                        <Card
                          data-aos="fade-up"
                          data-aos-delay={index * 100}
                          className="overflow-hidden transition-shadow duration-300 border-0 shadow-none py-0 rounded-lg bg-transparent h-full cursor-pointer hover:opacity-90"
                        >
                          <div className="aspect-4/3 overflow-hidden">
                            <Image
                              width={478}
                              height={284}
                              src={relatedBlog.coverImage || "/wellness02.jpg"}
                              alt={relatedBlog.title}
                              className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                          <CardContent className="p-2 gap-3 flex flex-col">
                            <div className="flex items-center gap-2 text-sm 3xl:text-lg font-saans text-black-color">
                              <span>{relatedBlog.category.title}</span>
                              <span>|</span>
                              <span>
                                {new Date(
                                  relatedBlog.createdAt
                                ).toLocaleDateString(locale, {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                            <h3 className="text-2xl 3xl:text-[28px] font-saans font-medium text-black-color line-clamp-2">
                              {relatedBlog.title}
                            </h3>
                            <div
                              className="text-black-color sub-heading-style text-base 3xl:text-[21px] line-clamp-3"
                              dangerouslySetInnerHTML={{
                                __html: sanitizeHtml(relatedBlog.description),
                              }}
                            />
                          </CardContent>
                        </Card>
                      </Link>
                    </CarouselItem>
                  ))}
                </CarouselContent>

                <CarouselPrevious className="absolute hidden xl:flex cursor-pointer left-0 top-1/2 -translate-y-1/2 bg-off-white-color hover:bg-off-white-color/90 size-10 border-0 transition-transform duration-300 [&>svg]:transition-transform [&>svg]:duration-300" />
                <CarouselNext className="absolute hidden xl:flex cursor-pointer right-0 top-1/2 -translate-y-1/2 bg-off-white-color hover:bg-off-white-color/40 size-10 border-0 transition-transform duration-300 [&>svg]:transition-transform [&>svg]:duration-300" />
              </Carousel>
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
              {relatedBlogs.map((relatedBlog, index) => (
                <Link
                  key={relatedBlog._id}
                  href={`/blog/${relatedBlog._id}`}
                  className="w-full min-w-0 sm:w-[calc(50%-0.75rem)] lg:w-[calc((100%-4rem)/3)]"
                >
                  <Card
                    data-aos="fade-up"
                    data-aos-delay={index * 100}
                    className="overflow-hidden transition-shadow duration-300 border-0 shadow-none py-0 rounded-lg bg-transparent h-full cursor-pointer hover:opacity-90"
                  >
                    <div className="aspect-4/3 overflow-hidden">
                      <Image
                        width={478}
                        height={284}
                        src={relatedBlog.coverImage || "/wellness02.jpg"}
                        alt={relatedBlog.title}
                        className="w-full h-full object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <CardContent className="p-2 gap-3 flex flex-col">
                      <div className="flex items-center gap-2 text-sm 3xl:text-lg font-saans text-black-color">
                        <span>{relatedBlog.category.title}</span>
                        <span>|</span>
                        <span>
                          {new Date(relatedBlog.createdAt).toLocaleDateString(
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
                        {relatedBlog.title}
                      </h3>
                      <div
                        className="text-black-color sub-heading-style text-base 3xl:text-[21px] line-clamp-3"
                        dangerouslySetInnerHTML={{
                          __html: sanitizeHtml(relatedBlog.description),
                        }}
                      />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </section>
  );
}
