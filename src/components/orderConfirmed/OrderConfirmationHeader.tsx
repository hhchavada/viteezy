import Link from "next/link";
import { useTranslations } from "next-intl";
import { ConfrimedOrder } from "../icons";
import { Button } from "../ui/button";

interface OrderConfirmationHeaderProps {
  orderData?: any;
}

export default function OrderConfirmationHeader({
  orderData,
}: OrderConfirmationHeaderProps) {
  const t = useTranslations("OrderConfirmed");
  return (
    <div className="pt-2 lg:pt-6 3xl:pt-14 lg:pb-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto text-center flex flex-col items-center justify-center">
        {/* Success Icon */}

        <ConfrimedOrder />
        <h1 className="text-2xl 4xl:text-3xl font-semibold mb-1 mt-3 3xl:mt-5 text-black-color">
          {t("orderConfirmedTitle")}
        </h1>
        <p className="text-charcol-gray line-clamp-2 lg:line-clamp-1 mb-6 lg:mb-6.5 text-base 3xl:text-lg">
          {t("orderConfirmedSubtitle")}
        </p>

        <Link href="/products" replace>
          <Button
            className="text-base! 3xl:text-lg! font-medium! h-11! 3xl:h-12! px-7 hover:rounded-lg bg-white! text-black-color border border-text-charcol-gray"
            variant="tealElevate"
            size="elevate"
            animateText
          >
            {t("continueShopping")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
