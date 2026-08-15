import baseApi from "./baseApi";
import { GetUserMeResponse } from "./types/user.types";
import { GetTransactionsBySubscriptionResponse } from "./types/transaction.types";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUserMe: builder.query<GetUserMeResponse, void>({
      query: () => "users/me",
      providesTags: ["User"],
    }),
    getTransactionsBySubscription: builder.query<
      GetTransactionsBySubscriptionResponse,
      string
    >({
      query: (subscriptionId) => ({
        url: "users/me/transactions",
        params: { subscriptionId },
      }),
      providesTags: ["User"],
    }),
    /**
     * Update current user's profile fields (e.g., name)
     */
    updateUserProfile: builder.mutation<
      GetUserMeResponse,
      { firstName?: string; lastName?: string; avatar?: string }
    >({
      query: (body) => ({
        url: "users/me",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
    updateUserLanguage: builder.mutation<
      GetUserMeResponse,
      { language: string }
    >({
      query: (body) => ({
        url: "users/me",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetUserMeQuery,
  useGetTransactionsBySubscriptionQuery,
  useUpdateUserLanguageMutation,
  useUpdateUserProfileMutation,
} = userApi;

