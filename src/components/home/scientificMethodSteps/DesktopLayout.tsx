import { stepsData } from "@/components/constants";
import DesktopStep from "./DesktopStep";
import { DesignedByScienceSection } from "@/store/api/types/landing.types";

const DesktopLayout = ({ data }: { data?: DesignedByScienceSection }) => (
  <div className="hidden md:flex items-start justify-evenly gap-y-20 gap-x-10 flex-wrap">
    {data?.steps?.map((step, index) => (
      <div
        className="max-w-[calc(50%-40px)] xl:max-w-[calc(33%-40px)]"
        data-aos="fade-up"
        data-aos-delay={index * 200}
        key={index}
      >
        <DesktopStep
          step={step}
          index={index}
          showArrow={index < stepsData.length - 1}
        />
      </div>
    ))}
  </div>
);

export default DesktopLayout;
