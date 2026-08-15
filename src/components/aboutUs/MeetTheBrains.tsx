"use client";

import React from "react";
import Image from "next/image";
import FallbackImage from "../ui/fallbackImage";

interface MeetTheBrainsProps {
  title: string;
  description: string;
  footnote: string;
  teamImage: string;
  teamImageAlt: string;
}

const MeetTheBrains: React.FC<MeetTheBrainsProps> = ({
  title,
  description,
  footnote,
  teamImage,
  teamImageAlt,
}) => {
  return (
    <section className="py-10 md:py-14 px-4">
      <div className=" mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-10 md:mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-black-color mb-4 font-saans">
            {title}
          </h2>
          <p className="text-base md:text-lg text-charcol-color leading-relaxed font-saans">
            {description}
          </p>
          {footnote && (
            <p className="text-sm md:text-base text-charcol-color mt-2 font-saans">
              {footnote}
            </p>
          )}
        </div>

        {/* Team Image */}
        <div className="relative w-full rounded-2xl md:rounded-3xl overflow-hidden">
          <div className="relative w-full aspect-[4/3] md:aspect-24/12">
            <FallbackImage
              src={teamImage}
              alt={teamImageAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 90vw, 1200px"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default MeetTheBrains;

