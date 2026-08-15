import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  CompleteQuizSessionResponse,
  CreateQuizSessionRequest,
  CreateQuizSessionResponse,
  GetActiveQuizSessionResponse,
  DiscardQuizSessionResponse,
  GetGoalsResponse,
  GetQuizSessionAnswersResponse,
  GetQuizConfigurationResponse,
  GetQuizSessionContactInfoResponse,
  QuizRecommendationCheckoutRequest,
  QuizRecommendationCheckoutResponse,
  QuizRecommendationAddonRequest,
  QuizRecommendationAddonResponse,
  QuizRecommendationPillQuantityRequest,
  QuizRecommendationPillQuantityResponse,
  QuizRecommendationProductVisibilityRequest,
  QuizRecommendationProductVisibilityResponse,
  SaveQuizSessionRequest,
  SaveQuizSessionResponse,
  SubmitQuizAnswerRequest,
  SubmitQuizAnswerResponse,
} from "./types/healthQuiz.types";
import { getQuizAuthHeaders } from "@/lib/quizGuestToken";

function resolveQuizApiBaseUrl(): string {
  const quizUrl = process.env.NEXT_PUBLIC_API_QUIZ_URL?.trim();
  if (quizUrl) return quizUrl.replace(/\/$/, "");

  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  if (apiUrl) return apiUrl.replace(/\/$/, "");

  // if (process.env.NODE_ENV === "development") {
  //   return "http://localhost:8050/api/v1";
  // }

  return "";
}

const QUIZ_API_BASE_URL = resolveQuizApiBaseUrl();

const healthQuizBaseQuery = fetchBaseQuery({
  baseUrl: QUIZ_API_BASE_URL,
  prepareHeaders: (headers) => {
    const authHeaders = getQuizAuthHeaders();
    Object.entries(authHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });

    headers.set("content-type", "application/json");
    return headers;
  },
});

export const healthQuizApi = createApi({
  reducerPath: "healthQuizApi",
  baseQuery: healthQuizBaseQuery,
  tagTypes: ["QuizSession", "QuizGoals", "QuizConfiguration", "QuizRecommendation"],
  endpoints: (builder) => ({
    getQuizConfiguration: builder.query<GetQuizConfigurationResponse, void>({
      query: () => "quiz-configuration",
      providesTags: ["QuizConfiguration"],
    }),

    createQuizSession: builder.mutation<
      CreateQuizSessionResponse,
      CreateQuizSessionRequest | void
    >({
      query: (body) => ({
        url: "quiz/session",
        method: "POST",
        body: body ?? {},
      }),
      invalidatesTags: ["QuizSession"],
    }),

    getQuizSession: builder.query<CreateQuizSessionResponse, string>({
      query: (sessionId) => `quiz/session/${sessionId}`,
      providesTags: ["QuizSession"],
    }),

    getQuizSessionAnswers: builder.query<GetQuizSessionAnswersResponse, string>({
      query: (sessionId) => `quiz/session/${sessionId}/answers`,
      providesTags: ["QuizSession"],
    }),

    getQuizSessionContactInfo: builder.query<
      GetQuizSessionContactInfoResponse,
      string
    >({
      query: (sessionId) => `quiz/session/${sessionId}/contact-info`,
      providesTags: ["QuizSession"],
    }),

    getActiveQuizSession: builder.query<GetActiveQuizSessionResponse, void>({
      query: () => "quiz/session/active",
    }),

    getGoals: builder.query<GetGoalsResponse, void>({
      query: () => "goals",
      providesTags: ["QuizGoals"],
    }),

    submitQuizAnswer: builder.mutation<
      SubmitQuizAnswerResponse,
      SubmitQuizAnswerRequest
    >({
      query: (args) => {
        const {
          sessionId,
          questionId,
          selectedOptionIds,
          selectedGoals,
          textAnswer,
          dateAnswer,
        } = args;

        if (selectedGoals !== undefined) {
          return {
            url: `quiz/session/${sessionId}/goals`,
            method: "PATCH",
            body: { selectedGoals },
          };
        }

        const body: Record<string, unknown> = {};

        if (questionId) {
          body.questionId = questionId;
        }

        if (selectedOptionIds !== undefined) {
          body.selectedOptionIds = selectedOptionIds;
        }
        if (textAnswer !== undefined) {
          body.textAnswer = textAnswer;
        }
        if (dateAnswer !== undefined) {
          body.dateAnswer = dateAnswer;
        }

        return {
          url: `quiz/session/${sessionId}/answers`,
          method: "PATCH",
          body,
        };
      },
      invalidatesTags: ["QuizSession"],
    }),

    completeQuizSession: builder.mutation<
      CompleteQuizSessionResponse,
      { sessionId: string; subscriptionId?: string }
    >({
      query: ({ sessionId, subscriptionId }) => ({
        url: `quiz/session/${sessionId}/complete`,
        method: "POST",
        body: subscriptionId ? { subscriptionId } : {},
      }),
      invalidatesTags: (_result, _error, { sessionId }) => [
        "QuizSession",
        { type: "QuizRecommendation", id: sessionId },
      ],
    }),

    getQuizSessionComplete: builder.query<
      CompleteQuizSessionResponse,
      { sessionId: string; subscriptionId?: string }
    >({
      query: ({ sessionId, subscriptionId }) => ({
        url: `quiz/session/${sessionId}/complete`,
        method: "POST",
        body: subscriptionId ? { subscriptionId } : {},
        headers: getQuizAuthHeaders(),
      }),
      providesTags: (_result, _error, { sessionId }) => [
        { type: "QuizRecommendation", id: sessionId },
      ],
    }),

    getQuizRecommendationComplete: builder.query<
      CompleteQuizSessionResponse,
      string
    >({
      query: (recommendationId) => ({
        url: `quiz/recommendation/${recommendationId}/complete`,
        method: "POST",
        body: {},
        headers: getQuizAuthHeaders(),
      }),
      providesTags: (_result, _error, recommendationId) => [
        { type: "QuizRecommendation", id: recommendationId },
      ],
    }),

    updateRecommendationPillQuantity: builder.mutation<
      QuizRecommendationPillQuantityResponse,
      QuizRecommendationPillQuantityRequest
    >({
      query: ({ recommendationId, productId, action }) => ({
        url: `quiz/recommendation/${recommendationId}/pill-quantity`,
        method: "PATCH",
        body: { productId, action },
        headers: getQuizAuthHeaders(),
      }),
      invalidatesTags: (_result, _error, { sessionId, recommendationId }) => {
        const tags: { type: "QuizRecommendation"; id: string }[] = [];
        if (sessionId) {
          tags.push({ type: "QuizRecommendation", id: sessionId });
        }
        if (recommendationId) {
          tags.push({ type: "QuizRecommendation", id: recommendationId });
        }
        return tags;
      },
    }),

    updateRecommendationProductVisibility: builder.mutation<
      QuizRecommendationProductVisibilityResponse,
      QuizRecommendationProductVisibilityRequest
    >({
      query: ({ recommendationId, productId, removed }) => ({
        url: `quiz/recommendation/${recommendationId}/products/visibility`,
        method: "PATCH",
        body: { productId, removed },
        headers: getQuizAuthHeaders(),
      }),
      invalidatesTags: (_result, _error, { sessionId, recommendationId }) => {
        const tags: { type: "QuizRecommendation"; id: string }[] = [];
        if (sessionId) {
          tags.push({ type: "QuizRecommendation", id: sessionId });
        }
        if (recommendationId) {
          tags.push({ type: "QuizRecommendation", id: recommendationId });
        }
        return tags;
      },
    }),

    addRecommendationAddon: builder.mutation<
      QuizRecommendationAddonResponse,
      QuizRecommendationAddonRequest
    >({
      query: ({ recommendationId, productId, remove }) => ({
        url: `quiz/recommendation/${recommendationId}/addon`,
        method: remove ? "DELETE" : "POST",
        body: { productId },
        headers: getQuizAuthHeaders(),
      }),
      invalidatesTags: (_result, _error, { sessionId, recommendationId }) => {
        const tags: { type: "QuizRecommendation"; id: string }[] = [];
        if (sessionId) {
          tags.push({ type: "QuizRecommendation", id: sessionId });
        }
        if (recommendationId) {
          tags.push({ type: "QuizRecommendation", id: recommendationId });
        }
        return tags;
      },
    }),

    recommendationCheckout: builder.mutation<
      QuizRecommendationCheckoutResponse,
      QuizRecommendationCheckoutRequest
    >({
      query: ({ recommendationId, bundleType }) => ({
        url: `quiz/recommendation/${recommendationId}/checkout`,
        method: "POST",
        body: { bundleType },
        headers: getQuizAuthHeaders(),
      }),
    }),

    saveQuizSession: builder.mutation<
      SaveQuizSessionResponse,
      SaveQuizSessionRequest
    >({
      query: ({
        sessionId,
        name,
        email,
        marketingConsent,
        whatsappConsent,
      }) => {
        const body: Record<string, unknown> = {
          name: name.trim(),
          email: email.trim(),
        };

        if (marketingConsent !== undefined) {
          body.marketingConsent = marketingConsent;
        }

        if (whatsappConsent !== undefined) {
          body.whatsappConsent = whatsappConsent;
        }

        return {
          url: `quiz/session/${sessionId}/save`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["QuizSession"],
    }),

    discardQuizSession: builder.mutation<DiscardQuizSessionResponse, string>({
      query: (sessionId) => ({
        url: `quiz/session/${sessionId}/discard`,
        method: "POST",
        body: {},
      }),
      invalidatesTags: ["QuizSession"],
    }),
  }),
});

export const {
  useGetQuizConfigurationQuery,
  useCreateQuizSessionMutation,
  useGetQuizSessionQuery,
  useLazyGetQuizSessionQuery,
  useLazyGetQuizSessionAnswersQuery,
  useLazyGetQuizSessionContactInfoQuery,
  useGetQuizSessionContactInfoQuery,
  useLazyGetActiveQuizSessionQuery,
  useGetGoalsQuery,
  useLazyGetGoalsQuery,
  useSubmitQuizAnswerMutation,
  useCompleteQuizSessionMutation,
  useGetQuizSessionCompleteQuery,
  useLazyGetQuizSessionCompleteQuery,
  useGetQuizRecommendationCompleteQuery,
  useLazyGetQuizRecommendationCompleteQuery,
  useUpdateRecommendationPillQuantityMutation,
  useUpdateRecommendationProductVisibilityMutation,
  useAddRecommendationAddonMutation,
  useRecommendationCheckoutMutation,
  useSaveQuizSessionMutation,
  useDiscardQuizSessionMutation,
} = healthQuizApi;

export { QUIZ_API_BASE_URL };
