"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import {
  useCreateQuizSessionMutation,
  useGetQuizSessionCompleteQuery,
  useGetQuizSessionContactInfoQuery,
  useRecommendationCheckoutMutation,
} from "@/store/api/healthQuizApi";
import { useInitQuizCheckoutPageSummaryMutation } from "@/store/api/cartApi";
import { getApiErrorFromUnknown } from "@/lib/apiError";
import { hasAuthToken } from "@/lib/utils";
import { getQuizSavedEmail, resolveQuizRecommendationError } from "@/lib/quizAccessError";
import {
  persistQuizSession,
  resolveRecommendationCompleteSource,
  syncCompletedQuizFromResponse,
  type RecommendationCompleteSource,
} from "@/components/quiz/questions/quizSessionStorage";
import QuizHeader from "@/components/quiz/QuizHeader";
import BlockingLoaderOverlay from "@/components/ui/blockingLoaderOverlay";
import GuestMagicLinkDialog from "./GuestMagicLinkNotice";
import type { PlanTier } from "@/types/recommendations";
import HeroBanner from "./HeroBanner";
import SupplementPlanCard from "./SupplementPlanCard";
import AddMembershipCard from "./AddMembershipCard";
import OrderDetailsCard from "./OrderDetailsCard";
import {
  buildQuizCheckoutContext,
  saveQuizCheckoutSession,
  toQuizPageSummaryBody,
} from "./quizCheckoutStorage";
import {
  getMonthlyPriceForTier,
  getOrderLinesForTier,
  mapQuizCompleteToRecommendations,
  type RecommendationsPageData,
} from "./mapQuizCompleteResponse";
import {
  clearSubscriptionQuizChangeContext,
  getSubscriptionChangeCycleDays,
  getSubscriptionQuizChangeContext,
  isSubscriptionChangeQuiz,
} from "@/lib/subscriptionQuizContext";
import { useConfirmSubscriptionQuizChangeMutation } from "@/store/api/subscriptionApi";
import { toast } from "react-hot-toast";

type LoadState = "loading" | "success" | "error" | "no-session";

type RecommendationNotice =
  | { type: "magic-link"; message: string }
  | { type: "error"; message: string };

export default function RecommendationsPage() {
  const router = useRouter();
  const tRec = useTranslations("Recommendations");
  const tQuiz = useTranslations("Quiz");
  const [completeSource, setCompleteSource] =
    useState<RecommendationCompleteSource | null>(null);
  const [pageData, setPageData] = useState<RecommendationsPageData | null>(null);
  const [activeTier, setActiveTier] = useState<PlanTier>("essential");
  const [loadState, setLoadState] = useState<LoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMagicLinkRequired, setIsMagicLinkRequired] = useState(false);
  const [actionNotice, setActionNotice] = useState<RecommendationNotice | null>(
    null
  );
  const [restartQuizError, setRestartQuizError] = useState<string | null>(null);
  const [isCheckoutPending, setIsCheckoutPending] = useState(false);
  const [isRestartPending, setIsRestartPending] = useState(false);
  const [recommendationUpdateKeys, setRecommendationUpdateKeys] = useState<
    Set<string>
  >(() => new Set());
  const hasInitializedTier = useRef(false);
  const checkoutInFlightRef = useRef(false);
  const [isSubscriptionChangeMode, setIsSubscriptionChangeMode] = useState(false);
  const [subscriptionIdForComplete, setSubscriptionIdForComplete] = useState<
    string | undefined
  >(undefined);
  const [hasResolvedSubscriptionContext, setHasResolvedSubscriptionContext] =
    useState(false);

  useEffect(() => {
    setCompleteSource(resolveRecommendationCompleteSource());
    const context = getSubscriptionQuizChangeContext();
    const isChangeFlow = context?.mode === "subscription_change";
    setIsSubscriptionChangeMode(isChangeFlow);
    setSubscriptionIdForComplete(
      isChangeFlow ? context?.subscriptionId : undefined
    );
    setHasResolvedSubscriptionContext(true);
  }, []);

  useEffect(() => {
    setActionNotice(null);
    setIsMagicLinkRequired(false);
  }, [completeSource?.id]);

  const sessionCompleteQuery = useGetQuizSessionCompleteQuery(
    {
      sessionId: completeSource?.id ?? "",
      ...(subscriptionIdForComplete
        ? { subscriptionId: subscriptionIdForComplete }
        : {}),
    },
    { skip: !completeSource || !hasResolvedSubscriptionContext }
  );

  const {
    data: completeData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = sessionCompleteQuery;

  const resolvedSessionId = completeData?.data?.sessionId?.trim() || null;
  const quizCacheKey =
    completeSource?.id || resolvedSessionId || pageData?.recommendationId || null;

  const contactSessionId = completeSource?.id || resolvedSessionId;

  const { data: contactInfoData } = useGetQuizSessionContactInfoQuery(
    contactSessionId ?? "",
    {
      skip: !contactSessionId || hasAuthToken(),
    }
  );

  const guestContactEmail =
    contactInfoData?.data?.email?.trim() || getQuizSavedEmail();

  const [recommendationCheckout, { isLoading: isRecommendationCheckoutLoading }] =
    useRecommendationCheckoutMutation();
  const [createQuizSession, { isLoading: isRestartingQuiz }] =
    useCreateQuizSessionMutation();
  const [initQuizCheckoutPageSummary, { isLoading: isCheckoutSummaryLoading }] =
    useInitQuizCheckoutPageSummaryMutation();
  const [
    confirmSubscriptionQuizChange,
    { isLoading: isConfirmingQuizChange },
  ] = useConfirmSubscriptionQuizChangeMutation();

  const isProceedingToCheckout =
    isRecommendationCheckoutLoading || isCheckoutSummaryLoading;
  const isCheckoutBlocked = isProceedingToCheckout || isCheckoutPending;
  const isSubscriptionConfirmBlocked =
    isConfirmingQuizChange || isCheckoutPending;
  const isRestartBlocked = isRestartingQuiz || isRestartPending;

  const isInitialLoading = loadState === "loading" || (isLoading && !pageData);

  const isRecommendationUpdating =
    recommendationUpdateKeys.size > 0 ||
    (isFetching && !isInitialLoading && loadState === "success");

  useEffect(() => {
    if (!completeSource) {
      setPageData(null);
      setLoadState("no-session");
      return;
    }

    if (isLoading) {
      setLoadState("loading");
      return;
    }

    if (error) {
      setPageData(null);
      setLoadState("error");
      const resolved = resolveQuizRecommendationError(
        error,
        tRec("loadFailed"),
        guestContactEmail
      );
      setIsMagicLinkRequired(resolved.requiresMagicLinkSignIn);
      setErrorMessage(resolved.message);
      return;
    }

    if (!completeData?.data) {
      setPageData(null);
      setLoadState("error");
      setErrorMessage(tRec("emptyResult"));
      return;
    }

    syncCompletedQuizFromResponse(completeData.data);

    const mapped = mapQuizCompleteToRecommendations(completeData.data);
    if (!mapped) {
      setPageData(null);
      setLoadState("error");
      setErrorMessage(tRec("emptyResult"));
      return;
    }

    if (!hasInitializedTier.current) {
      setActiveTier(mapped.defaultTier);
      hasInitializedTier.current = true;
    }

    setPageData(mapped);
    setLoadState("success");
    setErrorMessage(null);
    setIsMagicLinkRequired(false);
  }, [completeSource, completeData, isLoading, error, guestContactEmail, tRec]);

  const handleRecommendationUpdatingChange = useCallback(
    (key: string, isUpdating: boolean) => {
      setRecommendationUpdateKeys((current) => {
        const next = new Set(current);

        if (isUpdating) {
          next.add(key);
        } else {
          next.delete(key);
        }

        return next;
      });
    },
    []
  );

  const handleProceedToCheckout = useCallback(async () => {
    if (checkoutInFlightRef.current || isCheckoutBlocked || isRecommendationUpdating) {
      return;
    }

    if (!pageData?.recommendationId) {
      setActionNotice({
        type: "error",
        message:
          tRec("checkoutNotReady"),
      });
      return;
    }

    const activePlan =
      activeTier === "essential"
        ? pageData.essentialPlan
        : pageData.advancedPlan;
    const addedAddonCount =
      pageData.addOnProducts?.filter((product) => product.isAdded === true)
        .length ?? 0;

    // Allow checkout with bundle products and/or standup-pouch add-ons only.
    if (activePlan.supplementCount <= 0 && addedAddonCount <= 0) {
      setActionNotice({
        type: "error",
        message: tRec("checkoutNoProducts"),
      });
      return;
    }

    checkoutInFlightRef.current = true;
    setIsCheckoutPending(true);
    setActionNotice(null);

    let shouldKeepCheckoutLoader = false;

    try {
      const checkoutResponse = await recommendationCheckout({
        recommendationId: pageData.recommendationId,
        bundleType: activeTier,
      }).unwrap();

      const cartId = checkoutResponse.data?.cartId;
      if (!cartId) {
        throw new Error(tRec("cartNotCreated"));
      }

      const quizCheckoutContext = buildQuizCheckoutContext({
        cartId,
        recommendationId: pageData.recommendationId,
        bundleType: activeTier,
      });

      await initQuizCheckoutPageSummary(
        toQuizPageSummaryBody(quizCheckoutContext)
      ).unwrap();
      saveQuizCheckoutSession(quizCheckoutContext);

      shouldKeepCheckoutLoader = true;
      router.replace("/checkout");
    } catch (checkoutErr) {
      const resolved = resolveQuizRecommendationError(
        checkoutErr,
        tRec("checkoutFailed"),
        guestContactEmail
      );
      setActionNotice(
        resolved.requiresMagicLinkSignIn
          ? { type: "magic-link", message: resolved.message }
          : { type: "error", message: resolved.message }
      );
    } finally {
      if (!shouldKeepCheckoutLoader) {
        checkoutInFlightRef.current = false;
        setIsCheckoutPending(false);
      }
    }
  }, [
    pageData?.recommendationId,
    pageData?.essentialPlan,
    pageData?.advancedPlan,
    pageData?.addOnProducts,
    activeTier,
    isCheckoutBlocked,
    isRecommendationUpdating,
    recommendationCheckout,
    initQuizCheckoutPageSummary,
    router,
    guestContactEmail,
    tRec,
  ]);

  /** Subscription-change Confirm — only for Change Order quiz flow. */
  const handleConfirmSubscriptionChange = useCallback(async () => {
    if (
      !isSubscriptionChangeMode ||
      !isSubscriptionChangeQuiz() ||
      checkoutInFlightRef.current ||
      isSubscriptionConfirmBlocked ||
      isRecommendationUpdating
    ) {
      return;
    }

    const context = getSubscriptionQuizChangeContext();
    if (
      context?.mode !== "subscription_change" ||
      !context.subscriptionId
    ) {
      setActionNotice({
        type: "error",
        message: tRec("subscriptionConfirmMissingContext"),
      });
      return;
    }

    if (!pageData?.recommendationId) {
      setActionNotice({
        type: "error",
        message: tRec("checkoutNotReady"),
      });
      return;
    }

    const activePlan =
      activeTier === "essential"
        ? pageData.essentialPlan
        : pageData.advancedPlan;
    const addedAddonCount =
      pageData.addOnProducts?.filter((product) => product.isAdded === true)
        .length ?? 0;

    if (activePlan.supplementCount <= 0 && addedAddonCount <= 0) {
      setActionNotice({
        type: "error",
        message: tRec("checkoutNoProducts"),
      });
      return;
    }

    checkoutInFlightRef.current = true;
    setIsCheckoutPending(true);
    setActionNotice(null);

    let shouldNavigateAway = false;

    try {
      const response = await confirmSubscriptionQuizChange({
        subscriptionId: context.subscriptionId,
        recommendationId: pageData.recommendationId,
        bundleType: activeTier,
      }).unwrap();

      clearSubscriptionQuizChangeContext();
      toast.success(
        response.message?.trim() || tRec("subscriptionConfirmSuccess")
      );
      shouldNavigateAway = true;
      router.replace(
        `/settings/subscription/${context.subscriptionId}?tab=product-history`
      );
    } catch (confirmErr) {
      const message = getApiErrorFromUnknown(confirmErr, {
        fallback: tRec("subscriptionConfirmFailed"),
      });
      setActionNotice({
        type: "error",
        message,
      });
    } finally {
      if (!shouldNavigateAway) {
        checkoutInFlightRef.current = false;
        setIsCheckoutPending(false);
      }
    }
  }, [
    isSubscriptionChangeMode,
    isSubscriptionConfirmBlocked,
    isRecommendationUpdating,
    pageData?.recommendationId,
    pageData?.essentialPlan,
    pageData?.advancedPlan,
    pageData?.addOnProducts,
    activeTier,
    confirmSubscriptionQuizChange,
    router,
    tRec,
  ]);

  const handleDosageError = useCallback(
    (message: string, requiresMagicLinkSignIn = false) => {
      setActionNotice(
        requiresMagicLinkSignIn
          ? { type: "magic-link", message }
          : { type: "error", message }
      );
    },
    []
  );

  const handleLoginRequired = useCallback(() => {
    setActionNotice({
      type: "magic-link",
      message: tRec("magicLinkTitle"),
    });
  }, [tRec]);

  const handleRestartQuiz = useCallback(async () => {
    if (isRestartBlocked || isRecommendationUpdating) {
      return;
    }

    setRestartQuizError(null);
    setIsRestartPending(true);

    let shouldKeepRestartLoader = false;

    try {
      const response = await createQuizSession().unwrap();
      const session = response?.data;

      if (!session?.sessionId) {
        throw new Error(tQuiz("startFailed"));
      }

      if (!persistQuizSession(session)) {
        throw new Error(tQuiz("startFailed"));
      }

      shouldKeepRestartLoader = true;
      router.replace("/quiz/questions");
    } catch (restartErr) {
      setRestartQuizError(
        getApiErrorFromUnknown(restartErr, {
          fallback: tRec("restartFailed"),
        })
      );
    } finally {
      if (!shouldKeepRestartLoader) {
        setIsRestartPending(false);
      }
    }
  }, [createQuizSession, router, tQuiz, tRec, isRestartBlocked, isRecommendationUpdating]);

  const blockingOverlayMessage =
    isSubscriptionChangeMode && isSubscriptionConfirmBlocked
      ? tRec("orderConfirming")
      : isCheckoutBlocked
        ? tRec("orderPreparingCheckout")
        : isRestartBlocked
          ? tRec("orderRestartingQuiz")
          : isFetching && !isInitialLoading
            ? tRec("loading")
            : undefined;

  const showBlockingOverlay =
    isInitialLoading ||
    (isSubscriptionChangeMode
      ? isSubscriptionConfirmBlocked
      : isCheckoutBlocked) ||
    isRestartBlocked ||
    (isFetching && !isInitialLoading);

  const isMagicLinkDialogOpen =
    actionNotice?.type === "magic-link" || isMagicLinkRequired;

  const handleMagicLinkDialogOpenChange = (open: boolean) => {
    if (open) return;

    setActionNotice((current) =>
      current?.type === "magic-link" ? null : current
    );
    setIsMagicLinkRequired(false);
  };

  const magicLinkDialog = (
    <GuestMagicLinkDialog
      open={isMagicLinkDialogOpen}
      email={guestContactEmail}
      onOpenChange={handleMagicLinkDialogOpenChange}
    />
  );

  const blockingOverlay = (
    <BlockingLoaderOverlay
      open={showBlockingOverlay}
      message={blockingOverlayMessage}
    />
  );

  if (isInitialLoading) {
    return (
      <>
        <div className="min-h-screen bg-off-white-quiz-color">
          <QuizHeader progress={100} />
        </div>
        {blockingOverlay}
        {magicLinkDialog}
      </>
    );
  }

  if (loadState === "no-session" || loadState === "error" || !pageData) {
    const message =
      loadState === "no-session"
        ? tRec("noSession")
        : errorMessage || tRec("loadFailed");

    return (
      <>
        <div className="min-h-screen bg-off-white-quiz-color">
          <QuizHeader progress={100} />
          <main className="mx-auto max-w-6xl px-6 py-8">
            <div className="flex flex-col items-center gap-4 rounded-2xl border border-[#E8E8E8] bg-white px-6 py-12 text-center">
              {!isMagicLinkRequired ? (
                <p className="max-w-md font-saans text-base text-light-gray-color">
                  {message}
                </p>
              ) : null}
              {loadState === "error" && !isMagicLinkRequired ? (
                <Button
                  type="button"
                  variant="elevate"
                  size="elevate"
                  onClick={() => {
                    void refetch();
                  }}
                >
                  {tQuiz("retry")}
                </Button>
              ) : null}
            </div>
          </main>
        </div>
        {blockingOverlay}
        {magicLinkDialog}
      </>
    );
  }

  const orderLineItems = getOrderLinesForTier(pageData, activeTier);
  const monthlyPrice = getMonthlyPriceForTier(pageData, activeTier);
  const activePlan =
    activeTier === "essential" ? pageData.essentialPlan : pageData.advancedPlan;
  const addedAddonCount =
    pageData.addOnProducts?.filter((product) => product.isAdded === true)
      .length ?? 0;
  const hasCheckoutProducts =
    activePlan.supplementCount > 0 || addedAddonCount > 0;
  const isCheckoutDisabled =
    !hasCheckoutProducts || isRecommendationUpdating;
  const activePricing =
    activeTier === "essential"
      ? pageData.essentialPricing
      : pageData.advancedPricing;

  const subscriptionCycleDays = isSubscriptionChangeMode
    ? getSubscriptionChangeCycleDays()
    : undefined;
  const planPricePeriodLabel =
    isSubscriptionChangeMode && subscriptionCycleDays != null
      ? subscriptionCycleDays === 1
        ? tRec("perOneDay", { days: 1 })
        : tRec("perManyDays", { days: subscriptionCycleDays })
      : tRec("perMonth");

  return (
    <>
      <div className="min-h-screen bg-off-white-quiz-color">
        <QuizHeader progress={100} />
        <main className="mx-auto max-w-6xl px-6 py-8">
          <HeroBanner userName={pageData.userName} averageReview={4.8} />

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
          <SupplementPlanCard
            activeTier={activeTier}
            onTierChange={setActiveTier}
            essentialSupplements={pageData.essentialSupplements}
            advancedSupplements={pageData.advancedSupplements}
            essentialPlan={pageData.essentialPlan}
            advancedPlan={pageData.advancedPlan}
            noticeMessage={pageData.noticeMessage}
            addOnProducts={pageData.addOnProducts}
            currency={activePricing.currency}
            recommendationId={pageData.recommendationId}
            sessionId={quizCacheKey}
            guestContactEmail={guestContactEmail}
            onDosageError={handleDosageError}
            onRecommendationUpdatingChange={handleRecommendationUpdatingChange}
            hideAddOns={isSubscriptionChangeMode}
            pricePeriodLabel={planPricePeriodLabel}
          />

          <div className="flex flex-col gap-6">
            <AddMembershipCard
              membership={pageData.membership}
              onMembershipPurchased={() => {
                void refetch();
              }}
              onLoginRequired={handleLoginRequired}
            />
            {actionNotice?.type === "error" ? (
              <p className="font-saans text-sm text-red-600">
                {actionNotice.message}
              </p>
            ) : null}
            <OrderDetailsCard
              userName={pageData.userName}
              monthlyPrice={monthlyPrice}
              lineItems={orderLineItems}
              currency={activePricing.currency}
              isCheckoutLoading={
                isSubscriptionChangeMode
                  ? isSubscriptionConfirmBlocked
                  : isCheckoutBlocked
              }
              isCheckoutDisabled={isCheckoutDisabled}
              isRestartQuizLoading={isRestartBlocked}
              isRestartDisabled={isRecommendationUpdating}
              restartQuizError={restartQuizError}
              primaryButtonLabel={
                isSubscriptionChangeMode ? tRec("orderConfirm") : undefined
              }
              onProceedToCheckout={
                isSubscriptionChangeMode
                  ? handleConfirmSubscriptionChange
                  : handleProceedToCheckout
              }
              onRestartQuiz={handleRestartQuiz}
            />
          </div>
        </div>
        </main>
      </div>
      {blockingOverlay}
      {magicLinkDialog}
    </>
  );
}
