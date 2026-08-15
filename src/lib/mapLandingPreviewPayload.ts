// src/lib/mapLandingPreviewPayload.ts

import { LandingPage } from "@/store/api/types/landing.types";

// Helper to get array of values by prefix and count
function getArray(
  payload: any,
  prefix: string,
  count: number,
  fields: string[]
) {
  return Array.from({ length: count }).map((_, i) => {
    const obj: any = {};
    fields.forEach((f) => {
      obj[f] = payload[`${prefix}_${i}_${f}`] ?? "";
    });
    return obj;
  });
}

// Helper for simple string array (highlightedText, etc)
function getStringArray(payload: any, prefix: string, max: number) {
  return Array.from({ length: max })
    .map((_, i) => payload[`${prefix}_${i}`])
    .filter((v) => typeof v === "string" && v.trim() !== "");
}

export function mapLandingPreviewPayloadToLandingPage(
  payload: any,
  apiLandingPage?: LandingPage | null
): Partial<LandingPage> {
  if (!payload) return {};

  const highlightedText = Array.isArray(payload.heroSection_highlightedText)
    ? payload.heroSection_highlightedText
        .map((x: any) => (typeof x === "string" ? x : x?.value ?? ""))
        .filter((v: string) => typeof v === "string" && v.trim() !== "")
    : [];

  // HERO
  const heroSection = {
    videoUrl: payload.heroSection_video_url ?? "",
    backgroundImage: payload.heroBackgroundImage ?? "",
    title: payload.heroSection_title ?? "",
    highlightedText,
    subTitle: payload.heroSection_subTitle ?? "",
    description: payload.heroSection_description ?? "",
    primaryCTA: Array.isArray(payload.heroSection_primaryCTA)
      ? payload.heroSection_primaryCTA.map((cta: any, i: number) => ({
          label: cta?.label ?? "",
          image: cta?.image ?? "",
          link: cta?.link ?? "",
          order: cta?.order ?? i + 1,
        }))
      : [],
    isEnabled: !!payload.heroSection_isEnabled,
    order: Number(payload.heroSection_order ?? 1),
  };

  // MEMBERSHIP
  const membershipSection = {
    backgroundImage: payload.membershipBackgroundImage ?? "",
    title: payload.membershipSection_title ?? "",
    description: payload.membershipSection_description ?? "",
    benefits: Array.isArray(payload.membershipSection_benefits)
      ? payload.membershipSection_benefits.map((b: any, i: number) => ({
          icon: b?.icon ?? "",
          title: b?.title ?? "",
          description: b?.description ?? "",
          order: b?.order ?? i + 1,
        }))
      : [],
    isEnabled: !!payload.membershipSection_isEnabled,
    order: Number(payload.membershipSection_order ?? 2),
  };

  // HOW IT WORKS
  const howItWorksSection = {
    title: payload.howItWorksSection_title ?? "",
    subTitle: payload.howItWorksSection_subTitle ?? "",
    stepsCount: Number(payload.howItWorksSection_stepsCount ?? 3),
    steps: Array.isArray(payload.howItWorksSection_steps)
      ? payload.howItWorksSection_steps.map((step: any, i: number) => ({
          image: step?.image ?? "",
          title: step?.title ?? "",
          description: step?.description ?? "",
          order: step?.order ?? i + 1,
        }))
      : [],
    isEnabled: !!payload.howItWorksSection_isEnabled,
    order: Number(payload.howItWorksSection_order ?? 3),
  };

  // PRODUCT CATEGORY — from another site payload doesn't update categories; use API data directly
  const productCategorySection = {
    title: payload.productCategorySection_title ?? "",
    description: payload.productCategorySection_description ?? "",
    productCategories: apiLandingPage?.productCategorySection?.productCategories ?? [],
    isEnabled: !!payload.productCategorySection_isEnabled,
    order: Number(payload.productCategorySection_order ?? 4),
  };

  // COMMUNITY
  const communitySection = {
    backgroundImage: payload.communityBackgroundImage ?? "",
    title: payload.communitySection_title ?? "",
    subTitle: payload.communitySection_subTitle ?? "",
    metrics: Array.isArray(payload.communitySection_metrics)
      ? payload.communitySection_metrics.map((m: any, i: number) => ({
          label: m?.label ?? "",
          value:
            m?.value !== null && m?.value !== undefined ? String(m.value) : "",
          order: m?.order ?? i + 1,
        }))
      : [],
    isEnabled: !!payload.communitySection_isEnabled,
    order: Number(payload.communitySection_order ?? 5),
  };

  // FEATURES
  const featuresSection = {
    title: payload.featuresSection_title ?? "",
    description: payload.featuresSection_description ?? "",
    features: Array.isArray(payload.featuresSection_features)
      ? payload.featuresSection_features.map((f: any, i: number) => ({
          icon: f?.icon ?? "",
          title: f?.title ?? "",
          description: f?.description ?? "",
          order: f?.order ?? i + 1,
        }))
      : [],
    isEnabled: !!payload.featuresSection_isEnabled,
    order: Number(payload.featuresSection_order ?? 6),
  };

  // DESIGNED BY SCIENCE
  const designedByScienceSection = {
    title: payload.designedByScienceSection_title ?? "",
    description: payload.designedByScienceSection_description ?? "",
    steps: Array.isArray(payload.designedByScienceSection_steps)
      ? payload.designedByScienceSection_steps.map((step: any, i: number) => ({
          image: step?.image ?? "",
          title: step?.title ?? "",
          description: step?.description ?? "",
          order: step?.order ?? i + 1,
        }))
      : [],
    isEnabled: !!payload.designedByScienceSection_isEnabled,
    order: Number(payload.designedByScienceSection_order ?? 7),
  };

  // TESTIMONIALS — use API data when payload doesn't provide testimonials
  const payloadTestimonials = Array.isArray(payload.testimonialsSection_testimonials)
    ? payload.testimonialsSection_testimonials
    : [];
  const testimonialsSection = {
    title: payload.testimonialsSection_title ?? "",
    subTitle: payload.testimonialsSection_subTitle ?? "",
    testimonials:
      payloadTestimonials.length > 0
        ? payloadTestimonials
        : (apiLandingPage?.testimonialsSection?.testimonials ?? []),
    isEnabled: !!payload.testimonialsSection_isEnabled,
    order: Number(payload.testimonialsSection_order ?? 8),
  };

  // BLOG — use API data when payload doesn't provide blogs
  const payloadBlogs = Array.isArray(payload.blogSection_blogs) ? payload.blogSection_blogs : [];
  const blogSection = {
    title: payload.blogSection_title ?? "",
    description: payload.blogSection_description ?? "",
    blogs:
      payloadBlogs.length > 0 ? payloadBlogs : (apiLandingPage?.blogSection?.blogs ?? []),
    isEnabled: !!payload.blogSection_isEnabled,
    order: Number(payload.blogSection_order ?? 9),
  };

  // FAQ
  const payloadFaqs = Array.isArray(payload.faqSection_faqs) ? payload.faqSection_faqs : [];
  const faqSection = {
    title: payload.faqSection_title ?? "",
    description: payload.faqSection_description ?? "",
    faqs:
      payloadFaqs.length > 0 ? payloadFaqs : (apiLandingPage?.faqSection?.faqs ?? []),
    isEnabled: !!payload.faqSection_isEnabled,
    order: Number(payload.faqSection_order ?? 10),
  };

  return {
    heroSection,
    membershipSection,
    howItWorksSection,
    productCategorySection,
    communitySection,
    featuresSection,
    designedByScienceSection,
    testimonialsSection,
    blogSection,
    faqSection,
    isActive: payload.isActive ?? true,
    sectionOrder: payload.sectionOrder ?? [
      "heroSection",
      "membershipSection",
      "howItWorksSection",
      "productCategorySection",
      "communitySection",
      "featuresSection",
      "designedByScienceSection",
      "testimonialsSection",
      "blogSection",
      "faqSection",
    ],
    _id: payload._id ?? "",
    createdAt: payload.createdAt ?? "",
    updatedAt: payload.updatedAt ?? "",
  };
}
