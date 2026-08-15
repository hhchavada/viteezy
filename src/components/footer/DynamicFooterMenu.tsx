import Link from "next/link";
import { useTranslations } from "next-intl";
import { SocialIcon } from "@/components/icons";
import {
  navigationData as defaultNavigationData,
  paymentMethods,
} from "../constants/footer";
import type { SocialLinkItem } from "@/lib/generalSettings";
import Image from "next/image";
import { Language } from "../constants/countries";
import { useSortedCategories } from "@/hooks/useSortedCategories";

interface DynamicFooterMenuProps {
  className?: string;
  navigationData?: typeof defaultNavigationData;
  langs?: Language[];
  langValue?: string;
  onLangChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  socialLinks?: SocialLinkItem[];
  isLoadingSocial?: boolean;
}

const DynamicFooterMenu = ({
  className = "",
  navigationData = defaultNavigationData,
  langs,
  langValue,
  onLangChange,
  socialLinks = [],
  isLoadingSocial = false,
}: DynamicFooterMenuProps) => {
  const t = useTranslations("Footer");
  
  // Get sorted categories using the custom hook
  const { categories, isLoading: isLoadingCategories } = useSortedCategories(5);

  // Process navigation data to include dynamic categories
  const processNavigationData = () => {
    return navigationData.map((section) => {
      if (section.title === "Shop") {
        return {
          ...section,
          links: [
            section.links[0], // Keep "All products"
            ...categories.map((category) => ({
              label: category.label,
              href: category.href,
            })),
          ],
        };
      }
      return section;
    });
  };

  const processedNavigationData = processNavigationData();

  return (
    <div className={`${className} text-white`}>
      <div className="hidden md:flex">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 w-[60%]">
          {/* Navigation Columns */}
          {processedNavigationData.map((section, index) => (
            <div
              data-aos="fade-up"
              data-aos-delay={index * 100}
              key={section.title}
              className="flex flex-col"
            >
              <h3 className="font-saans font-medium text-xl mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-saans text-[17px] text-white/90 hover:text-teal-300 transition-colors duration-200 flex items-center gap-2 font-medium"
                    >
                      {link.label}
                      {("badge" in link && link.badge) ? (
                        <span className="bg-orange-200 text-black text-[12px] px-2 py-0.5 rounded-full font-regular">
                          {String(link.badge)}
                        </span>
                      ) : null}
                    </Link>
                  </li>
                ))}
                {(section as { hasLanguageSelector?: boolean }).hasLanguageSelector && (
                  <li className="mt-2">
                    <div className="flex items-center gap-2 font-saans text-sm text-white/90">
                      {/* <Globe className="w-4 h-4" /> */}
                      <select
                        value={langValue}
                        onChange={onLangChange && onLangChange}
                        className="bg-transparent border-none text-white/90 hover:text-white cursor-pointer focus:outline-none appearance-none"
                      >
                        {langs?.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.flag}&nbsp;&nbsp;{lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          ))}
        </div>
        <div
          data-aos="fade-up"
          data-aos-delay="600"
          className="flex-1 pl-8 ms-auto max-w-fit space-y-8 md:space-y-12"
        >
          {/* Follow Us Section - only show when we have links from general settings */}
          {(isLoadingSocial || socialLinks.length > 0) && (
            <div className="flex flex-col ms-auto">
            <h3 className="font-saans font-medium text-lg mb-4">
              {t("followUs")}
            </h3>
              <div className="flex flex-wrap gap-4">
                {isLoadingSocial ? (
                  <div className="flex gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-6 h-6 rounded bg-white/20 animate-pulse"
                        aria-hidden
                      />
                    ))}
                  </div>
                ) : (
                  socialLinks.map((social) => (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/90 hover:text-white transition-colors duration-200"
                      aria-label={social.name}
                    >
                      <SocialIcon name={social.name} />
                    </Link>
                  ))
                )}
              </div>
            </div>
          )}
          {/* {t("securePayment")} Section */}
          <div className="">
            <h3 className="font-saans font-medium text-lg mb-4">
              {t("securePayment")}
            </h3>
            <div className="flex flex-wrap gap-3 items-center">
              {paymentMethods.map((method) => (
                <div key={method.name} className="rounded">
                  {/* <span className="text-xs md:text-sm text-white/80 font-medium">
                    {method.name}
                  </span> */}
                  <Image
                    height={28}
                    width={44}
                    src={method?.img}
                    alt={method?.name}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DynamicFooterMenu;
