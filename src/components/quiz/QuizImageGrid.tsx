import QuizImageCard from "./QuizImageCard";
import { quizCardSizes, quizStartImages } from "./constants";

type ImageSlot = {
  fallbackSrc: string;
  alt: string;
  variant?: "solid" | "gradient";
  maxWidth: number;
  maxHeight: number;
  smallImageClassName?: string;
  fluidImageClassName?: string;
  smallClassName?: string;
  fluidClassName?: string;
};

const imageSlots: ImageSlot[] = [
  {
    fallbackSrc: quizStartImages.girl,
    alt: "Healthcare professional",
    maxWidth: quizCardSizes.girl.maxWidth,
    maxHeight: quizCardSizes.girl.maxHeight,
    smallImageClassName: "object-cover object-top",
    fluidImageClassName: "object-cover object-top",
    smallClassName: "w-full justify-self-center",
    fluidClassName: "col-start-1 row-start-1 row-span-2 self-center xl:-ml-15",
  },
  {
    fallbackSrc: quizStartImages.productTin,
    alt: "Viteezy personalized vitamins",
    variant: "gradient",
    maxWidth: quizCardSizes.productTin.maxWidth,
    maxHeight: quizCardSizes.productTin.maxHeight,
    smallImageClassName: "object-cover ",
    fluidImageClassName: "object-cover object-center",
    smallClassName: "w-full justify-self-center",
    fluidClassName: "col-start-2 row-start-1 self-start",
  },
  {
    fallbackSrc: quizStartImages.sachet,
    alt: "Personalized vitamin sachet",
    variant: "gradient",
    maxWidth: quizCardSizes.sachet.maxWidth,
    maxHeight: quizCardSizes.sachet.maxHeight,
    smallImageClassName: "object-cover",
    fluidImageClassName: "object-cover",
    smallClassName: "w-full justify-self-center",
    fluidClassName:
      "col-start-2 row-start-2 w-full max-w-[242px] justify-self-start self-end mt-[clamp(1rem,6vh,5rem)]",
  },
  {
    fallbackSrc: quizStartImages.energyPouch,
    alt: "Viteezy Energy Assistant",
    maxWidth: quizCardSizes.energyPouch.maxWidth,
    maxHeight: quizCardSizes.energyPouch.maxHeight,
    smallImageClassName: "object-cover object-top",
    fluidImageClassName: "object-cover object-top",
    smallClassName: "w-full justify-self-center",
    fluidClassName:
      "col-start-3 row-start-1 row-span-2 self-end mb-[clamp(1rem,6vh,5rem)] xl:ml-10",
  },
];

function resolveSlotSrc(index: number, imageUrls?: string[]): string {
  const fromApi = imageUrls?.[index]?.trim();
  return fromApi || imageSlots[index].fallbackSrc;
}

interface QuizImageGridProps {
  imageUrls?: string[];
}

function QuizImageGridSmall({ imageUrls }: QuizImageGridProps) {
  return (
    <div className="mx-auto hidden w-full max-w-[480px] grid-cols-2 gap-3 max-[479px]:grid sm:gap-4">
      {imageSlots.map((slot, index) => (
        <QuizImageCard
          key={slot.fallbackSrc}
          src={resolveSlotSrc(index, imageUrls)}
          alt={slot.alt}
          variant={slot.variant}
          maxWidth={slot.maxWidth}
          maxHeight={slot.maxHeight}
          imageClassName={slot.smallImageClassName}
          className={slot.smallClassName}
        />
      ))}
    </div>
  );
}

function QuizImageGridFluid({ imageUrls }: QuizImageGridProps) {
  return (
    <div className="hidden w-full max-w-[837px] min-[480px]:grid grid-cols-[minmax(0,242fr)_minmax(0,353fr)_minmax(0,242fr)] grid-rows-[auto_auto] items-center gap-x-3 gap-y-3 sm:gap-x-4 sm:gap-y-4 md:gap-x-6 md:gap-y-4">
      {imageSlots.map((slot, index) => (
        <QuizImageCard
          key={`fluid-${slot.fallbackSrc}`}
          src={resolveSlotSrc(index, imageUrls)}
          alt={slot.alt}
          variant={slot.variant}
          maxWidth={slot.maxWidth}
          maxHeight={slot.maxHeight}
          imageClassName={slot.fluidImageClassName}
          className={slot.fluidClassName}
        />
      ))}
    </div>
  );
}

export default function QuizImageGrid({ imageUrls }: QuizImageGridProps) {
  return (
    <div className="flex w-full justify-center px-3 sm:px-4 md:px-6">
      <QuizImageGridSmall imageUrls={imageUrls} />
      <QuizImageGridFluid imageUrls={imageUrls} />
    </div>
  );
}
