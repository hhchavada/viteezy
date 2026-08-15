"use client";

import dynamic from "next/dynamic";
import MemberBenefits from "@/components/home/memberBenefits";
import HowItWork from "@/components/home/howItWork";
import Hero from "./hero";
import { useGetLandingPageDataQuery } from "@/store/api/landingApi";
import FullscreenLoader from "../ui/fullscreenLoader";
import { useLandingPreviewMessage } from "@/hooks/useLandingPreviewMessage";
import { useMemo } from "react";
import { mapLandingPreviewPayloadToLandingPage } from "@/lib/mapLandingPreviewPayload";
import { useTranslations } from "next-intl";

const belowFoldLoading = () => (
  <div className="min-h-[240px] w-full" aria-hidden />
);

const HealthDiscovery = dynamic(
  () => import("@/components/home/healthDiscovery"),
  { loading: belowFoldLoading }
);
const HealthMission = dynamic(
  () => import("@/components/home/healthMission"),
  { loading: belowFoldLoading }
);
const WhyChooseUs = dynamic(() => import("./whyChooseUs"), {
  loading: belowFoldLoading,
});
const ScientificMethodSteps = dynamic(
  () => import("./scientificMethodSteps"),
  { loading: belowFoldLoading }
);
const RealCustomerReview = dynamic(
  () => import("./realCustomerReview"),
  { loading: belowFoldLoading }
);
const HealthAndWellnessInsights = dynamic(
  () => import("./helthAndWellnessInsights"),
  { loading: belowFoldLoading }
);
const FAQSection = dynamic(() => import("./faq"), {
  loading: belowFoldLoading,
});

const ADMIN_ORIGIN =
  process.env.NEXT_PUBLIC_ADMIN_ORIGIN ?? "http://localhost:8081";

export default function HomeBase() {
  const t = useTranslations("Landing");
  const { data, isLoading, error } = useGetLandingPageDataQuery();
  const livePayload = useLandingPreviewMessage<Record<string, unknown>>(ADMIN_ORIGIN);

  const apiLandingPage = data?.data?.landingPage;

  // Merge: live preview overrides API; mapper uses apiLandingPage for testimonials, blogs & product categories when payload doesn't provide them
  const landingData = useMemo(() => {
    if (!apiLandingPage) return undefined;
    if (!livePayload) return apiLandingPage;
    const previewLanding = mapLandingPreviewPayloadToLandingPage(livePayload, apiLandingPage);
    return { ...apiLandingPage, ...previewLanding };
  }, [apiLandingPage, livePayload]);

  if (isLoading) return <FullscreenLoader />;
  if (error) {
    return (
      <div className="min-h-[calc(100vh-48px)] flex items-center px-4 justify-center">
        {t("somethingWentWrong")}
      </div>
    );
  }
  return (
    <div className="min-h-screen">
      <div className="bg-off-white-color">
        <Hero data={landingData?.heroSection} />
        <HowItWork data={landingData?.howItWorksSection} />
        <MemberBenefits data={landingData?.membershipSection} />
      </div>
      <HealthDiscovery data={landingData?.productCategorySection} />
      <HealthMission data={landingData?.communitySection} />
      <WhyChooseUs data={landingData?.featuresSection} />
      <ScientificMethodSteps data={landingData?.designedByScienceSection} />
      <RealCustomerReview data={landingData?.testimonialsSection} />
      <div className="bg-linear-to-b from-[#F7F6F0] to-[#FAF9F600] section-pt">
        <HealthAndWellnessInsights data={landingData?.blogSection} />
        <FAQSection data={landingData?.faqSection} />
      </div>
    </div>
  );
}
