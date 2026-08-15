import Image from "next/image";
import { cn } from "@/lib/utils";

type QuizImageCardVariant = "solid" | "gradient";

interface QuizImageCardProps {
  src: string;
  alt: string;
  variant?: QuizImageCardVariant;
  maxWidth: number;
  maxHeight: number;
  imageClassName?: string;
  className?: string;
}

const VIEWPORT_HEIGHT_SCALE = 0.12;

export default function QuizImageCard({
  src,
  alt,
  variant = "solid",
  maxWidth,
  maxHeight,
  imageClassName,
  className,
}: QuizImageCardProps) {
  const viewportHeightCap = (maxHeight * VIEWPORT_HEIGHT_SCALE).toFixed(2);

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden rounded-3xl shadow-quiz-card",
        variant === "solid" ? "bg-warm-sand-color" : "bg-quiz-card-gradient",
        className
      )}
      style={{
        maxWidth,
        maxHeight: `min(${maxHeight}px, ${viewportHeightCap}vh)`,
        aspectRatio: `${maxWidth} / ${maxHeight}`,
      }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        className={cn("object-contain object-center", imageClassName)}
        sizes={`(max-width: 768px) 50vw, ${maxWidth}px`}
        priority
      />
    </div>
  );
}
