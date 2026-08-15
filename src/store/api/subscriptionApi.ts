import baseApi from "./baseApi";
import {
  GetSubscriptionsResponse,
  GetSubscriptionByIdResponse,
  GetSubscriptionsParams,
  GetSubscriptionProductsResponse,
  GetSubscriptionProductsStatusResponse,
  UpdateSubscriptionProductsResponse,
} from "./types/subsciption.types";
import {
  GetPostponementsBySubscriptionResponse,
  CreatePostponementRequest,
  CreatePostponementResponse,
} from "./types/postponement.types";

export const subsciptionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getSubscription: builder.query<
      GetSubscriptionsResponse,
      GetSubscriptionsParams | void
    >({
      query: (params) => ({
        url: "/subscriptions",
        params: params ?? {},
      }),
      serializeQueryArgs: ({ queryArgs }) => {
        return "getSubscriptions";
      },
      merge: (currentCache, response, meta) => {
        const page = meta.arg?.page ?? 1;
        if (page === 1) return response;
        return {
          ...response,
          data: [...(currentCache?.data ?? []), ...(response.data ?? [])],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        (currentArg?.page ?? 1) !== (previousArg?.page ?? 1),
      providesTags: ["Subscription"],
    }),
    getSubscriptionById: builder.query<GetSubscriptionByIdResponse, string>({
      query: (id) => `/subscriptions/${id}`,
      providesTags: ["Subscription"],
    }),
    getSubscriptionProducts: builder.query<
      GetSubscriptionProductsResponse,
      string
    >({
      query: (id) => `/subscriptions/${id}/products`,
      providesTags: ["Subscription"],
    }),
    getSubscriptionProductsStatus: builder.query<
      GetSubscriptionProductsStatusResponse,
      { subscriptionId: string; page?: number; limit?: number }
    >({
      // Larger page size = fewer round-trips (backend work is similar per request).
      query: ({ subscriptionId, page = 1, limit = 100 }) =>
        `/subscriptions/${subscriptionId}/products/status?page=${page}&limit=${limit}`,
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs.subscriptionId}`;
      },
      merge: (currentCache, response, meta) => {
        if ((meta.arg.page ?? 1) === 1) {
          return response;
        }
        const existingIds = new Set(
          (currentCache.data || []).map((item) => item._id),
        );
        const nextItems = (response.data || []).filter(
          (item) => !existingIds.has(item._id),
        );
        return {
          ...response,
          data: [...(currentCache.data || []), ...nextItems],
        };
      },
      forceRefetch: ({ currentArg, previousArg }) => {
        return (
          (currentArg?.page ?? 1) !== (previousArg?.page ?? 1) ||
          (currentArg?.limit ?? 100) !== (previousArg?.limit ?? 100)
        );
      },
      providesTags: ["Subscription"],
    }),
    updateSubscriptionProducts: builder.mutation<
      UpdateSubscriptionProductsResponse,
      { subscriptionId: string; productIds: string[] }
    >({
      query: ({ subscriptionId, productIds }) => ({
        url: `/subscriptions/actions/${subscriptionId}/update/products`,
        method: "POST",
        body: { productIds },
      }),
      invalidatesTags: ["Subscription", "Cart"],
    }),
    removeSubscriptionProduct: builder.mutation<
      { success: boolean; message: string },
      { subscriptionId: string; productId: string }
    >({
      query: ({ subscriptionId, productId }) => ({
        url: `/subscriptions/actions/${subscriptionId}/update/products/remove`,
        method: "POST",
        body: { productId },
      }),
      invalidatesTags: ["Subscription", "Cart"],
    }),
    confirmSubscriptionUpdate: builder.mutation<
      { success: boolean; message: string },
      { subscriptionId: string; cartId: string }
    >({
      query: ({ subscriptionId, cartId }) => ({
        url: `/subscriptions/actions/${subscriptionId}/update/confirm`,
        method: "POST",
        body: { cartId },
      }),
      invalidatesTags: ["Subscription", "Cart"],
    }),
    confirmSubscriptionQuizChange: builder.mutation<
      { success: boolean; message?: string },
      {
        subscriptionId: string;
        recommendationId: string;
        bundleType: "essential" | "advanced";
      }
    >({
      query: ({ subscriptionId, recommendationId, bundleType }) => ({
        url: `/subscriptions/actions/${subscriptionId}/quiz-change/confirm`,
        method: "POST",
        body: { recommendationId, bundleType },
      }),
      invalidatesTags: ["Subscription"],
    }),
    getPostponementsBySubscription: builder.query<
      GetPostponementsBySubscriptionResponse,
      string
    >({
      query: (subscriptionId) => ({
        url: "/postponements",
        params: { subscriptionId },
      }),
      providesTags: ["Subscription"],
    }),
    createPostponement: builder.mutation<
      CreatePostponementResponse,
      CreatePostponementRequest
    >({
      query: (body) => ({
        url: "/postponements",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Subscription"],
    }),
    pauseSubscription: builder.mutation<
      { success: boolean; message?: string },
      string
    >({
      query: (subscriptionId) => ({
        url: `/subscriptions/${subscriptionId}/pause`,
        method: "POST",
      }),
      invalidatesTags: ["Subscription"],
    }),
    cancelSubscription: builder.mutation<
      { success: boolean; message?: string },
      string
    >({
      query: (subscriptionId) => ({
        url: `/subscriptions/${subscriptionId}/cancel`,
        method: "POST",
      }),
      invalidatesTags: ["Subscription"],
    }),
    changeShippingAddress: builder.mutation<
      { success: boolean; message?: string },
      { subscriptionId: string; shippingAddressId: string }
    >({
      query: ({ subscriptionId, shippingAddressId }) => ({
        url: `/subscriptions/${subscriptionId}/change-shipping-address`,
        method: "POST",
        body: { shippingAddressId },
      }),
      invalidatesTags: ["Subscription", "Addresses"],
    }),
  }),
});

export const {
  useGetSubscriptionQuery,
  useGetSubscriptionByIdQuery,
  useGetPostponementsBySubscriptionQuery,
  useCreatePostponementMutation,
  usePauseSubscriptionMutation,
  useCancelSubscriptionMutation,
  useChangeShippingAddressMutation,
  useGetSubscriptionProductsQuery,
  useGetSubscriptionProductsStatusQuery,
  useUpdateSubscriptionProductsMutation,
  useRemoveSubscriptionProductMutation,
  useConfirmSubscriptionUpdateMutation,
  useConfirmSubscriptionQuizChangeMutation,
} = subsciptionApi;
