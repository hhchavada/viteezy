/* ======================================================
     Landing Page Root
  ====================================================== */

export interface LandingPageResponse {
  landingPage: LandingPage;
  language: string;
}

export interface LandingPage {
  _id: string;
  isActive: boolean;
  sectionOrder: LandingSectionKey[];
  createdAt: string;
  updatedAt: string;

  heroSection: HeroSection;
  membershipSection: MembershipSection;
  howItWorksSection: HowItWorksSection;
  productCategorySection: ProductCategorySection;
  communitySection: CommunitySection;
  featuresSection: FeaturesSection;
  designedByScienceSection: DesignedByScienceSection;
  testimonialsSection: TestimonialsSection;
  blogSection: BlogSection;
  faqSection: FAQSection;
}

export type LandingSectionKey =
  | "heroSection"
  | "membershipSection"
  | "howItWorksSection"
  | "productCategorySection"
  | "communitySection"
  | "featuresSection"
  | "designedByScienceSection"
  | "testimonialsSection"
  | "blogSection"
  | "faqSection";

/* ======================================================
     Shared Small Types (kept here intentionally)
  ====================================================== */

export interface CTA {
  label: string;
  image: string;
  link: string;
  order: number;
}

export interface ImageAsset {
  type?: string;
  url: string;
  sortOrder?: number;
}

/* ======================================================
     Hero Section
  ====================================================== */

export interface HeroSection {
  videoUrl: string;
  backgroundImage: string;
  title: string;
  highlightedText: string[];
  subTitle: string;
  description: string;
  primaryCTA: CTA[];
  isEnabled: boolean;
  order: number;
}

/* ======================================================
     Membership Section
  ====================================================== */

export interface MembershipSection {
  backgroundImage: string;
  title: string;
  description: string;
  benefits: MembershipBenefit[];
  isEnabled: boolean;
  order: number;
}

export interface MembershipBenefit {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: string | any;
  title: string;
  description: string;
  type?: string;
  order?: number;
  id?: string | number;
}

/* ======================================================
     How It Works Section
  ====================================================== */

export interface HowItWorksSection {
  title: string;
  subTitle: string;
  stepsCount: number;
  steps: HowItWorksStep[];
  isEnabled: boolean;
  order: number;
}

export interface HowItWorksStep {
  image: string;
  title: string;
  description: string;
  order: number;
}

/* ======================================================
     Product Category Section
  ====================================================== */

export interface ProductCategorySection {
  title: string;
  description: string;
  productCategories: ProductCategory[];
  isEnabled: boolean;
  order: number;
}

export interface ProductCategory {
  _id: string;
  slug: string;
  name: string;
  description: string;
  sortOrder: number;
  icon: string;
  image: ImageAsset | null;
  productCount: number;
}

/* ======================================================
     Community Section
  ====================================================== */

export interface CommunitySection {
  backgroundImage: string;
  title: string;
  subTitle: string;
  metrics: CommunityMetric[];
  isEnabled: boolean;
  order: number;
}

export interface CommunityMetric {
  label: string;
  value: string;
  order: number;
}

/* ======================================================
     Features / Designed by Science
  ====================================================== */

export interface FeaturesSection {
  title: string;
  description: string;
  features: FeatureItem[];
  isEnabled: boolean;
  order: number;
}

export interface FeatureItem {
  icon: string;
  title: string;
  description: string;
  order: number;
}

export interface DesignedByScienceStep {
  title: string;
  description: string;
  image: string;
  order: number;
}

export interface DesignedByScienceSection {
  title: string;
  description: string;
  steps: DesignedByScienceStep[];
  isEnabled: boolean;
  order: number;
}

/* ======================================================
     Testimonials Section
  ====================================================== */

export interface TestimonialsSection {
  title: string;
  subTitle: string;
  testimonials: Testimonial[];
  isEnabled: boolean;
  order: number;
}

export interface Testimonial {
  _id: string;
  videoUrl: string;
  videoThumbnail: string;
  products: Product[];
  isFeatured: boolean;
  displayOrder: number;
}

/* ======================================================
     Product (minimal, landing specific)
  ====================================================== */

export interface Price {
  currency: string;
  amount: number;
  taxRate: number;
}

export interface Product {
  _id: string;
  title: string;
  slug: string;
  productImage: string;
  price: Price;
}

/* ======================================================
     Blog Section
  ====================================================== */

export interface BlogSection {
  title: string;
  description: string;
  blogs: Blog[];
  isEnabled: boolean;
  order: number;
}

export interface Blog {
  _id: string;
  title: string;
  description: string;
  coverImage: string | null;
  seo: BlogSEO;
  createdAt: string;
  viewCount: number;
  author?: string;
}

export interface BlogSEO {
  metaTitle: string;
  metaSlug: string;
  metaDescription: string;
}

/* ======================================================
     FAQ Section
  ====================================================== */

export interface FAQSection {
  title: string;
  description: string;
  faqs: FAQItem[];
  isEnabled: boolean;
  order: number;
}

export interface FAQItem {
  question: string;
  answer: string;
  order: number;
}
