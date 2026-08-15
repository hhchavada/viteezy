"use client";

import React from "react";
import Image from "next/image";
import FallbackImage from "../ui/fallbackImage";

interface FounderQuoteProps {
  quote: string;
  quoteDescription: string;
  author: string;
  authorRole: string;
  authorImage: string;
  noteTitle: string;
  noteContent: string[];
}

const FounderQuote: React.FC<FounderQuoteProps> = ({
  quote,
  quoteDescription,
  author,
  authorRole,
  authorImage,
  noteTitle,
  noteContent,
}) => {
  return (
    <section className="py-10 md:py-14 px-4 bg-off-white-color max-w-[1120px] w-full mx-auto">
      <div className=" mx-auto max-w-7xl">
        {/* Quote Section */}
        <div className="">
          <div className="relative mx-auto max-w-3xl">
            {/* Large Quote Mark */}
            <div className="absolute -top-2 md:-top-4 left-0 z-0">
              <span className="text-7xl md:text-9xl lg:text-[20rem] text-teal-500/30 leading-none select-none font-saans-trial">
                &quot;
              </span>
            </div>

            {/* Quote Text */}
            <div className="relative z-10 pt-6 md:pt-10 pl-4 md:pl-6">
              <p className="text-lg md:text-xl lg:text-2xl italic text-charcol-color leading-relaxed max-w-4xl font-saans">
                {quote}
              </p>

              {/* Attribution */}
              <p className="mt-3 text-base md:text-lg text-teal-500 font-saans">
                {quoteDescription ? quoteDescription : `${author}, ${authorRole}`}
              </p>
            </div>
          </div>
        </div>

        {/* Founder Note Section */}
        <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-10 md:gap-12 lg:gap-16 items-start mt-10 md:mt-16">
          {/* Left: Founder Image */}
          <div className="flex flex-col items-center lg:items-start bg-white p-5 shadow-sm max-w-[400px] w-full mx-auto lg:mx-0">
            <div className="relative w-full aspect-12/13 overflow-hidden mb-5">
              <FallbackImage
                src={authorImage}
                alt={author}
                fill
                className="object-cover"
              />
            </div>
            <div className="text-center lg:text-left">
              <h3 className="text-xl md:text-2xl font-semibold text-black-color font-saans">
                {author}
              </h3>
              <p className="text-base text-gray-600 font-saans">{authorRole}</p>
            </div>
          </div>

          {/* Right: Note Content */}
          <div className="space-y-6 mt-2 lg:mt-0">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-black-color font-saans">
              {noteTitle}
            </h2>
            <div className="space-y-4">
              {noteContent.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-base md:text-lg text-charcol-color leading-relaxed font-saans"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <p className="text-base md:text-lg text-charcol-color font-saans mt-6">
              Much love,
              <br />
              <span className="font-semibold">{author}</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FounderQuote;
