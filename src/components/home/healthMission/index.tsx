"use client";

import { stats } from "@/components/constants";
import Counter from "./Counter";
import { CommunitySection } from "@/store/api/types/landing.types";
import Image from "next/image";
import { memo } from "react";
import { useTranslations } from "next-intl";

function HealthMission({ data }: { data?: CommunitySection }) {
  const t = useTranslations("Landing");
  if (!data?.isEnabled) return null;
  return (
    <section className="w-full p-2 radius-style bg-o">
      <div className="relative overflow-hidden radius-style bg-cover bg-center bg-no-repeat  flex flex-col justify-center items-center ">
        <Image
          height={450}
          width={1920}
          className="h-[280px] sm:h-[350px] lg:h-[450px] min-w-full object-cover radius-style bg-gray-50"
          src={data?.backgroundImage || "/memberMission.jpg"}
          alt={data?.title || t("weNeedBetterHealthToday")}
          quality={65}
        />
        {/* Center content card */}
        <div className="-mt-40 sm:-mt-53 lg:mt-0 flex items-center justify-center px-4 lg:absolute -bottom-2 w-full">
          <div className="bg-off-white-color  rounded-t-2xl rounded-b-2xl lg:rounded-b-none  w-full  mx-auto px-8 md:px-16 py-7  max-w-[1320px]">
            <h2 className="text-center text-3xl md:text-4xl font-medium font-saans text-black-color mb-2 mt-2">
              {data?.title || t("weNeedBetterHealthToday")}
            </h2>
            <p className="text-center text-black-color text-base md:text-lg font-saans max-w-4xl mx-auto mb-10">
              {data?.subTitle ||
                t("missionForHealth")}
            </p>
            {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-1 max-w-5xl mx-auto md:gap-18 px-10"> */}
            <div className="flex  gap-8 md:gap-1 max-w-5xl mx-auto md:gap-4 px-10 justify-evenly flex-wrap space-y-4">
              {data?.metrics?.map((s, idx) =>
                s.value ? (
                  <div
                    key={idx}
                    className="w-full sm:w-2/6 xl:w-[calc(25%-20px)]"
                  >
                    <Counter value={s.value} label={s.label} duration={2} />
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(HealthMission);
