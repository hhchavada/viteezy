import VideoContent from "./VideoContent";
import HeroContent from "./HeroContent";
import { HeroSection } from "@/store/api/types/landing.types";
import { memo } from "react";

function Hero({ data }: { data?: HeroSection }) {
  if (!data?.isEnabled) return null;

  return (
    // <section className="relative w-full xl:h-screen max-h-[860px] xl:min-h-[750px] overflow-hidden px-2.5 bg-none rounded-2xl grid lg:grid-cols-2 gap-2.5">
    <section className="relative w-full xl:h-screen xl:min-h-[850px] 3xl:min-h-[842px] 2xl:max-h-[calc(100vh-127px)] overflow-hidden px-2.5 pt-4 md:pt-0 bg-none rounded-2xl flex flex-col lg:flex-row gap-2.5">
      <div
        data-aos="fade-right"
        className="grid-cols-1 rounded-xl md:rounded-3xl xl:rounded-4xl overflow-hidden lg:w-[48%] aspect-video md:aspect-auto"
      >
        <VideoContent data={data} />
      </div>
      <div
        data-aos="fade-left"
        className="rounded-xl md:rounded-3xl xl:rounded-4xl overflow-hidden lg:w-[52%]"
      >
        <HeroContent data={data} />
      </div>
    </section>
  );
}

export default memo(Hero);
