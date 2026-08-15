import { FeaturesSection } from "@/store/api/types/landing.types";
import { useTranslations } from "next-intl";

const HeaderSection = ({ data }: { data?: FeaturesSection }) => {
  const t = useTranslations("Landing");
  return (
    <div className="space-y-3 flex-1 xl:flex-[0.4] lg:max-w-2xl text-center xl:text-start w-full">
      <h2
        data-aos="fade-right"
        data-aos-delay="300"
        id="why-choose-us-heading"
        className="heading-style text-black-color"
      >
        {data?.title || t("whyChooseViteezy")}
      </h2>
      <p
        data-aos="fade-right"
        data-aos-delay="300"
        className="sub-heading-style max-w-md mx-auto xl:mx-0"
      >
        {data?.description ||
          t("simplifyWellnessRoutine")}
      </p>
    </div>
  );
};

export default HeaderSection;
