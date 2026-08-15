"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import FallbackImage from "../ui/fallbackImage";
import { useTranslations } from "next-intl";

interface Blog {
  _id: string;
  title: string;
  coverImage: string | null;
  seo?: {
    metaSlug?: string;
  };
}

export default function SideMenuBlogSlider({
  blogs = [],
  onClose,
}: {
  blogs: Blog[];
  onClose: () => void;
}) {
  const t = useTranslations("Header");
  const tLanding = useTranslations("Landing");
  if (!blogs.length) return null;

  return (
    <div className="mt-6 ">
      <h3 className="text-teal-300 text-lg font-medium px-6">
        {/* {t("shopViteezyEdit")} */}
        {tLanding("allBlogs")}
      </h3>

      <Carousel
        opts={{
          align: "start",
          loop: false,
        }}
        className="w-full"
      >
        <CarouselContent className="ml-2">
          {blogs.map((blog) => (
            <CarouselItem
              key={blog._id}
              className="pl-4 basis-[75%] select-none" // 👈 1.2 slide effect
              onClick={onClose}
            >
              <Link href={`/blog/${blog?.seo?.metaSlug ?? blog._id}`}>
                <Card className="border-0 rounded-xl overflow-hidden shadow-none bg-transparent pt-4 pb-6.5">
                  <CardContent className="p-0">
                    {/* Image */}
                    <div className="relative w-full h-45">
                      <FallbackImage
                        src={blog?.coverImage || ""}
                        alt={blog.title}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Content */}
                    <div className="">
                      <h4 className="text-lg font-medium text-white line-clamp-2 mt-3 break-all">
                        {blog.title}
                      </h4>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
