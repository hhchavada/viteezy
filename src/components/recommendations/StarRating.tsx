import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxStars?: number;
}

export default function StarRating({ rating, maxStars = 5 }: StarRatingProps) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating} out of ${maxStars} stars`}
    >
      {Array.from({ length: maxStars }, (_, index) => {
        const filled = index < Math.floor(rating);
        const half = !filled && index < rating;

        return (
          <Star
            key={index}
            className={`size-3 sm:size-3.5 md:size-4 ${
              filled || half
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        );
      })}
    </div>
  );
}
