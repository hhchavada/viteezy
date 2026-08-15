import FallbackImage from "@/components/ui/fallbackImage";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HeroButton({
  btnTxt,
  bg = "bg-black",
  img = "",
  link = "",
}: {
  btnTxt?: string;
  bg?: string;
  img?: string;
  link?: string;
}) {
  const t = useTranslations("Landing");
  const buttonText = btnTxt || t("takeTheQuiz");
  return (
    <Link
      href={link}
      className="w-full max-w-[168px] md:max-w-none md:w-auto md:min-w-[180px] hover-image-breakpoint:min-w-[200px] group relative hover-image-breakpoint:h-[300px] overflow-hidden hover-image-breakpoint:p-2 cursor-pointer"
    >
      <div className="absolute inset-0 rounded-2xl overflow-hidden hidden hover-image-breakpoint:block">
        <div className="group-hover:scale-110 transition-all duration-500 h-full ease-out">
          <FallbackImage
            className="w-full h-full object-cover circle-reveal  transition-all duration-500"
            src={img || "/bannerImg1.png"}
            alt={t("bannerImg1")}
            width={1000}
            height={500}
            priority
          />
        </div>
      </div>

      <button
        className={`${bg} w-full sm:w-[184px] 3xl:w-[200px] relative z-10 transition-all block mx-auto duration-400 cursor-pointer text-white px-4 sm:px-7 py-3.5 sm:py-4 3xl:py-[13px] rounded-4xl group-hover:rounded-xl text-sm sm:text-base 3xl:text-lg font-medium`}
      >
        <span className="max-h-5 xl:max-h-5.5 3xl:max-h-7 overflow-hidden block">
          <span className="block truncate md:hidden">{buttonText}</span>
          <span className="hidden md:block group-hover:-translate-y-[50%] transition-all duration-300">
            <span className="block truncate">{buttonText}</span>
            <span className="block truncate">{buttonText}</span>
          </span>
        </span>
      </button>
    </Link>
  );
}
