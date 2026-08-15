"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "../ui/button";
import { Marquee } from "../ui/marquee";
import FallbackImage from "../ui/fallbackImage";

export interface TeamMember {
  id: string;
  name: string;
  role?: string;
  image: string;
  imageAlt: string;
}

interface TeamMembersProps {
  title: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  members: TeamMember[];
}

interface TeamMemberCardProps {
  member: TeamMember;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member }) => {
  const memberImageSrc = member?.image || "/aboutUs/user1.png";
  return (
    <div className="group transition-transform shrink-0 w-[50vw] sm:w-60 lg:w-[20vw]">
      <div className="relative w-full aspect-15/21 rounded-lg overflow-hidden mb-3">
        <FallbackImage
          src={memberImageSrc}
          alt={member.imageAlt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 200px, (max-width: 768px) 240px, 280px"
        />
      </div>
      {member.name && (
        <div className="text-center">
          <h3 className="text-base md:text-lg font-semibold text-black-color font-saans">
            {member.name}
          </h3>
          {member.role && (
            <p className="text-sm text-gray-600 font-saans">{member.role}</p>
          )}
        </div>
      )}
    </div>
  );
};

const TeamMembers: React.FC<TeamMembersProps> = ({
  title,
  description,
  buttonText,
  buttonLink,
  members,
}) => {
  return (
    <section className="py-10 md:py-14">
      <div className="mx-auto">
        {/* Header */}
        <div className="w-section px-4 text-center mb-8 md:mb-12 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-black-color mb-4 font-saans">
            {title}
          </h2>
          <p className="text-base md:text-lg text-charcol-color leading-relaxed mb-6 font-saans">
            {description}
          </p>
          {buttonText && buttonLink ? (
            <Link href={buttonLink}>
              <Button
                variant="elevate"
                size="elevate"
                animateText
                className="bg-black-color text-white hover:bg-gray-800"
              >
                {buttonText}
              </Button>
            </Link>
          ) : null}
        </div>

        {/* Team Marquee */}
        <div className="relative flex w-full overflow-hidden mt-8 md:mt-12">
          <Marquee className="[--duration:30s] [--gap:1.5rem]">
            {members.map((member) => (
              <TeamMemberCard key={member.id} member={member} />
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
};

export default TeamMembers;
