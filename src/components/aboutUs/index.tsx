"use client";

import React from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import FounderQuote from "./FounderQuote";
import MeetTheBrains from "./MeetTheBrains";
import ViteezyTimeline from "./ViteezyTimeline";
import TeamMembers from "./TeamMembers";
import ContactUsBottom from "../contactUs/ContactUsBottom";
import { useGetAboutUsQuery } from "@/store/api/aboutUsApi";
import FallbackImage from "../ui/fallbackImage";

const AboutUsPage = () => {
  const locale = useLocale();
  const t = useTranslations("AboutUs");
  const { data, isLoading } = useGetAboutUsQuery({ lang: locale });
  const aboutUs = data?.data?.aboutUs;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!aboutUs) {
    return null;
  }

  const { banner, founderStory, founderNote, meetBrains, timeline, people } =
    aboutUs;

  return (
    <div className="w-full">
      {/* Banner Section */}
      <div className="w-full py-8 sm:py-12 md:py-14">
        <div className="w-section mx-auto w-full">
          <div className="flex items-start md:items-end flex-col md:flex-row md:justify-between gap-5 md:gap-10">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl sm:max-w-xl font-medium ">
                {banner?.banner_title}
              </h1>
              {banner?.banner_subtitle && (
                <p className="max-w-3xl text-base sm:text-lg leading-tight mt-5">
                  {banner?.banner_subtitle}
                </p>
              )}
            </div>
            {banner?.banner_button_text && (
              <Link href={banner.banner_button_link || "#"}>
                <Button variant="elevate" size="elevate" animateText>
                  {banner.banner_button_text}
                </Button>
              </Link>
            )}
          </div>
        </div>
        <div className="px-4 sm:px-3 overflow-hidden rounded-2xl">
          {banner?.banner_image?.url && (
            <FallbackImage
              src={banner.banner_image.url}
              alt={t("aboutUsBanner")}
              className="w-full mt-7 sm:mt-14 object-cover min-h-[230px] max-h-[550px] rounded-[28px]"
              width={1920}
              height={550}
            />
          )}
        </div>
      </div>

      {/* Founder Quote Section */}
      {founderStory && (
        <FounderQuote
          quote={founderNote.headline}
          quoteDescription={founderNote.description}
          author={founderStory.name}
          authorRole={founderStory.position}
          authorImage={founderStory.image?.url || ""}
          noteTitle={founderStory.headline}
          noteContent={
            founderStory.description ? [founderStory.description] : []
          }
        />
      )}

      {/* Meet the Brains Section */}
      {meetBrains && (
        <MeetTheBrains
          title={meetBrains.meet_brains_title}
          description={meetBrains.meet_brains_subtitle}
          footnote=""
          teamImage={meetBrains.meet_brains_main_image?.url || ""}
          teamImageAlt={t("teamWorkingTogetherAlt")}
        />
      )}

      {/* Timeline Section */}
      {timeline && timeline.timeline_events?.length > 0 && (
        <ViteezyTimeline
          title={timeline.timeline_section_title}
          subtitle={timeline.timeline_section_description}
          entries={timeline.timeline_events.map((event) => ({
            date: event.year,
            title: event.title,
            description: event.description,
            isActive: true,
          }))}
        />
      )}

      {/* Team Members Section */}
      {people && (
        <TeamMembers
          title={people.title}
          description={people.subtitle}
          // buttonText={t("ourTeam")}
          // buttonLink="/ourTeam"
          members={people.images.map((img, index) => ({
            id: String(index),
            name: "",
            image: img.url,
            imageAlt: t("teamMemberPhotoAlt", { n: index + 1 }),
          }))}
        />
      )}

      {/* Contact Us Bottom Section */}
      <ContactUsBottom />
    </div>
  );
};

export default AboutUsPage;
