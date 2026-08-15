"use client";

import Spinner from "@/components/ui/spinner";

interface QuizLoadingStateProps {
  message: string;
  className?: string;
}

export default function QuizLoadingState({
  message,
  className = "min-h-[calc(100vh-80px)]",
}: QuizLoadingStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-4 ${className}`}
      aria-busy="true"
      aria-live="polite"
    >
      <Spinner size="lg" color="teal-green" />
      <p className="font-saans text-base text-light-gray-color">{message}</p>
    </div>
  );
}
