import { Suspense } from "react";
import MagicLinkPage from "@/components/quiz/MagicLinkPage";

function MagicLinkFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-off-white-quiz-color">
      <p className="font-saans text-base text-light-gray-color">
        Opening your recommendations...
      </p>
    </div>
  );
}

export default function QuizMagicLinkRoutePage() {
  return (
    <Suspense fallback={<MagicLinkFallback />}>
      <MagicLinkPage />
    </Suspense>
  );
}
