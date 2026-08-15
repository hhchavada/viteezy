"use client";

import Banner from "../ui/banner";
import { useTranslations } from "next-intl";

interface ContactUsBannerProps {
  backgroundImage?: string;
  title?: string;
  description?: string;
}

const ContactUsBanner: React.FC<ContactUsBannerProps> = ({
  backgroundImage = "/products/productHeroBanner.png",
  title,
  description,
}) => {
  const t = useTranslations("ContactUs");
  const tCommon = useTranslations("Common");
  
  const breadcrumbs = [
    { label: tCommon("home"), href: "/" },
    { label: t("title"), isActive: true },
  ];

  return (
    <Banner
      backgroundImage={backgroundImage}
      breadcrumbs={breadcrumbs}
      title={title || t("title")}
      description={description || t("description")}
    />
  );
};

export default ContactUsBanner;

