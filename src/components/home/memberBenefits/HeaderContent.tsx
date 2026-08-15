"use client";

import { MembershipSection } from "@/store/api/types/landing.types";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { hasAuthToken } from "@/lib/utils";
import { useGetUserMeQuery } from "@/store/api/userApi";

const HeaderContent = ({ data }: { data?: MembershipSection }) => {
  const tMembership = useTranslations("Membership");
  const tCommon = useTranslations("Common");
  const tHeader = useTranslations("Header");
  const [hideMembershipCta, setHideMembershipCta] = useState(false);

  // GET /users/me - skip when not logged in; hide Membership CTA when user is member or sub-member
  const { data: userMeData } = useGetUserMeQuery(undefined, {
    skip: !hasAuthToken(),
  });
  const user = userMeData?.data?.user;

  useEffect(() => {
    setHideMembershipCta(
      Boolean(user && (user.isMember === true || user.isSubMember === true)),
    );
  }, [user]);

  return (
    <div className="relative z-10 flex flex-col lg:flex-row  justify-between items-start lg:items-center gap-5 sm:gap-8 mb-14 mt-5 max-w-6xl w-full px-6">
      <div className="flex flex-col gap-2">
        <h1
          data-aos="fade-right"
          className="text-white font-saans max-w-3xl heading-style break-all line-clamp-2"
        >
          {data?.title || tMembership("pageHeroTitle")}
        </h1>
        <p
          data-aos="fade-right"
          data-aos-delay="300"
          className="text-white/90 font-saans font-regular max-w-xl text-lg leading-tight line-clamp-3 break-all"
        >
          {data?.description || tMembership("pageHeroDescription")}
        </p>
      </div>

      {!hideMembershipCta && (
        <Link
          href="/membership"
          data-aos="fade-left"
          data-aos-delay="300"
          className="flex bg-white backdrop-blur-sm rounded-full px-2 py-1.5 border border-white/20 hover:bg-white/95 transition-colors cursor-pointer"
        >
          <span className="text-black font-saans font-medium mr-2 ml-1">
            {tCommon("membership")}
          </span>
          <span className="bg-teal-green-color font-saans text-white text-xs px-2 py-1 rounded-full font-medium">
            {tHeader("Pro")}
          </span>
        </Link>
      )}
    </div>
  );
};

export default HeaderContent;
