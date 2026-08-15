import { baseApi } from "./baseApi";
import { productApi } from "./productApi";
import type {
  ToggleWishlistRequest,
  ToggleWishlistResponse,
  GetWishlistResponse,
} from "./types/wishlist.types";

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<
      GetWishlistResponse,
      { page?: number; limit?: number }
    >({
      query: (params) => ({
        url: "wishlist",
        params: params,
      }),
      providesTags: ["Wishlist"],
    }),

    toggleWishlist: builder.mutation<
      ToggleWishlistResponse,
      ToggleWishlistRequest
    >({
      query: (body) => ({
        url: "wishlist/toggle",
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Wishlist"],
      async onQueryStarted(
        { productId, status },
        { dispatch, queryFulfilled },
      ) {
        // For toggle operations: API sends current state, cache updates to opposite
        // For force operations: API sends target state, cache updates to that state
        // Since we can't distinguish, we'll update to opposite for toggle logic
        const isLikedGoal = status === 0; // If sending 0 (add), update to true (liked)

        // Update individual product cache
        const productPatchResult = dispatch(
          productApi.util.updateQueryData(
            "getProductById",
            productId,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (draft: any) => {
              const target = draft?.data?.product || draft?.data;
              if (target) target.is_liked = isLikedGoal;
            },
          ),
        );

        // Update products list cache - invalidate to force refetch with updated data
        dispatch(productApi.util.invalidateTags(["Product"]));

        // Update categories with products cache
        const categoriesPatchResult = dispatch(
          productApi.util.updateQueryData(
            "getCategoriesWithProducts",
            undefined,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (draft: any) => {
              if (draft?.data?.categories) {
                draft.data.categories.forEach((category: any) => {
                  if (category.products) {
                    const product = category.products.find((p: any) => p._id === productId);
                    if (product) product.is_liked = isLikedGoal;
                  }
                });
              }
            },
          ),
        );

        try {
          await queryFulfilled;
        } catch {
          productPatchResult.undo();
          categoriesPatchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useLazyGetWishlistQuery,
  useToggleWishlistMutation,
} = wishlistApi;
