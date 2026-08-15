
"use client";

import React, { memo, useCallback, useState } from "react";
import TeamMemberCard from "./TeamMemberCard";
import MemberDetailsDrawer from "./MemberDetailsDrawer";
import { useGetTeamMembersQuery } from "@/store/api/teamApi";
import { TeamMember } from "@/store/api/types/team.types";
import { Button } from "../ui/button";
import { useLocale } from "next-intl";

const OurTeamBase = () => {
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const locale = useLocale();

  const { data, isLoading } = useGetTeamMembersQuery({ lang: locale });

  const banner = data?.data?.banner;
  const members = data?.data?.teamMembers || [];

  const handleCloseDrawer = useCallback(() => {
    setSelectedMember(null);
  }, []);

  const handleMemberClick = useCallback((member: TeamMember) => {
    setSelectedMember(member);
  }, []);

  return (
    <>
      <div className="w-full w-section mx-auto py-8 sm:py-16">
        <div className="max-w-xl md:max-w-4xl">
          {banner?.title && (
            <>
              <h1 className="text-4xl sm:text-5xl md:text-[52px] font-medium text-black-color mb-3 md:mb-4 wrap-break-word">
                {banner.title}
              </h1>
              {banner?.subtitle && (
                <p 
                  className="text-base md:text-lg leading-tight wrap-break-word"
                  dangerouslySetInnerHTML={{ __html: banner.subtitle }}
                />
              )}
            </>
          )}
        </div>

        {/* Initial Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-4.5 gap-y-8 mt-10 lg:mt-19">
            {members.map((item) => (
              <TeamMemberCard
                data={item}
                key={item._id}
                onClick={handleMemberClick}
              />
            ))}
          </div>
        )}
      </div>

      <MemberDetailsDrawer
        isOpen={Boolean(selectedMember)}
        onClose={handleCloseDrawer}
        member={selectedMember}
      />
    </>
  );
};

export default memo(OurTeamBase);