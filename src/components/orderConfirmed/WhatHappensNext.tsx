import {
  Delivered,
  OrderConfirmedIcon,
  PreparingPackage,
  ShippingTruck,
} from "../icons";
import { useTranslations } from "next-intl";

interface WhatHappensNextProps {
  orderData?: any;
}

export default function WhatHappensNext({ orderData }: WhatHappensNextProps) {
  const t = useTranslations("OrderConfirmed");
  const orderSteps = [
    {
      id: 1,
      title: t("stepOrderConfirmedTitle"),
      description: t("stepOrderConfirmedDescription"),
      icon: <OrderConfirmedIcon />,
    },
    {
      id: 2,
      title: t("stepPreparingPackageTitle"),
      description: t("stepPreparingPackageDescription"),
      icon: <PreparingPackage />,
    },
    {
      id: 3,
      title: t("stepShippedTitle"),
      description: t("stepShippedDescription"),
      icon: <ShippingTruck />,
    },
    {
      id: 4,
      title: t("stepDeliveredTitle"),
      description: t("stepDeliveredDescription"),
      icon: <Delivered />,
    },
  ];
  return (
    <div className="pb-18 3xl:pb-22">
      <div className="max-w-[850px] 3xl:max-w-[980px] mx-auto">
        <h2 className="text-2xl 3xl:text-3xl font-semibold text-center my-5 text-black-color">
          {t("whatHappensNext")}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:gap-2.5 px-3 auto-rows-fr">
          {orderSteps.map((step) => (
            <div key={step.id} className="bg-white rounded-lg p-4 3xl:p-6 h-full flex">
              <div className="flex items-center gap-6">
                <div className="shrink-0">{step.icon}</div>
                <div>
                  <h3 className="text-base 3xl:text-lg font-medium text-black-color mb-1.25">
                    {step.title}
                  </h3>
                  <p className="text-charcol-gray text-sm 3xl:text-base leading-tight line-clamp-2">
                    {step.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
