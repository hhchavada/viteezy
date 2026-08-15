"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import QuizHeader from "@/components/quiz/QuizHeader";
import { useVerifyMagicLinkMutation } from "@/store";
import { getApiErrorFromUnknown } from "@/lib/apiError";
import { persistMagicLinkRecommendationContext } from "@/components/quiz/questions/quizSessionStorage";

export default function MagicLinkPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token")?.trim() ?? "";
  const tQuiz = useTranslations("Quiz");

  const [verifyMagicLink, { isLoading }] = useVerifyMagicLinkMutation();
  const [isVerified, setIsVerified] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!token || isLoading) return;

    setErrorMessage(null);

    try {
      const result = await verifyMagicLink(token).unwrap();

      if (!result.success) {
        throw new Error(result.message || tQuiz("magicLinkVerificationFailed"));
      }

      const { recommendationId, sessionId } = result.data;
      if (!sessionId?.trim()) {
        throw new Error(tQuiz("magicLinkTryAgain"));
      }

      persistMagicLinkRecommendationContext({
        recommendationId,
        sessionId,
      });

      setIsVerified(true);
      router.replace("/recommendation");
    } catch (error) {
      setErrorMessage(
        getApiErrorFromUnknown(error, {
          fallback: tQuiz("magicLinkTryAgain"),
        })
      );
    }
  };

  return (
    <div className="min-h-screen bg-off-white-quiz-color">
      <QuizHeader progress={100} />

      <main className="mx-auto flex min-h-[calc(100vh-88px)] max-w-md items-center px-6 py-10">
        <div className="w-full rounded-2xl border border-[#E3E3DC] bg-white p-6 shadow-[0_12px_40px_rgba(0,0,0,0.06)] sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div
              className={`flex size-16 items-center justify-center rounded-full ${
                isVerified
                  ? "bg-[#E8F8F5] text-[#23B299]"
                  : "bg-[#F5EED0] text-[#6B5B2E]"
              }`}
            >
              {isVerified ? (
                <CheckCircle2 className="size-8" aria-hidden />
              ) : (
                <Mail className="size-8" aria-hidden />
              )}
            </div>

            <h1 className="mt-5 font-saans text-2xl font-semibold text-black-color">
              {isVerified
                ? tQuiz("magicLinkOpeningTitle")
                : tQuiz("magicLinkViewTitle")}
            </h1>

            <p className="mt-2 font-saans text-sm leading-6 text-light-gray-color sm:text-base">
              {isVerified
                ? tQuiz("magicLinkSignedInRedirecting")
                : tQuiz("magicLinkVerifyDescription")}
            </p>

            {!isVerified ? (
              <Button
                type="button"
                variant="elevate"
                size="elevate"
                className="mt-8 w-full rounded-full bg-[#23B299] py-3.5 font-saans text-base font-medium text-white hover:bg-[#1fa389] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={!token || isLoading}
                onClick={() => {
                  void handleVerify();
                }}
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                    {tQuiz("magicLinkVerifying")}
                  </span>
                ) : (
                  tQuiz("magicLinkVerify")
                )}
              </Button>
            ) : (
              <div className="mt-8 flex items-center gap-2 font-saans text-sm text-[#23B299]">
                <Loader2 className="size-4 animate-spin" aria-hidden />
                {tQuiz("magicLinkRedirecting")}
              </div>
            )}

            {!token ? (
              <p className="mt-4 font-saans text-sm text-light-gray-color">
                {tQuiz("magicLinkMissingToken")}
              </p>
            ) : null}

            {errorMessage ? (
              <p className="mt-4 font-saans text-sm text-[#C24141]">
                {errorMessage}
              </p>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}
