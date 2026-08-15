import { baseApi } from "./baseApi";
import type {
  CategoriesWithProductsResponse,
  GetProductCategoriesResponse,
  GetProductGoalsResponse,
  GetProductIngredientsResponse,
  ProductFiltersResponse,
  GetProductsResponse,
  GetProductByIdResponse,
} from "./types/product.types";
import { getLanguageQueryForApi, getLanguageCode } from "@/lib/services/language";

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET ALL PRODUCTS
     * Fetch list of all products
     * Language handling:
     * - If user logged in: language fetched from user/me
     * - If user not logged in: language passed as query parameter
     */
    getProducts: builder.query<
      GetProductsResponse,
      {
        categories?: string;
        healthGoal?: string;
        ingredientIds?: string;
        hasStandupPouch?: boolean;
        sortBy?: string;
        page?: number;
        limit?: number;
        search?: string;
      } | void
    >({
      query: (params) => {
        const args = params ?? {};
        const queryParams = new URLSearchParams();

        queryParams.append("lang", getLanguageQueryForApi());

        if (args.categories) {
          queryParams.append("categories", args.categories);
        }
        if (args.healthGoal) {
          queryParams.append("healthGoal", args.healthGoal);
        }
        if (args.ingredientIds) {
          queryParams.append("ingredientIds", args.ingredientIds);
        }
        if (args.hasStandupPouch === true) {
          queryParams.append("hasStandupPouch", "true");
        }
        if (args.sortBy) {
          queryParams.append("sortBy", args.sortBy);
        }
        if (args.search) {
          queryParams.append("search", args.search);
        }
        queryParams.append("page", String(args.page ?? 1));
        queryParams.append("limit", String(args.limit ?? 16));

        return `/products?${queryParams.toString()}`;
      },
      serializeQueryArgs: ({ queryArgs }) => {
        const args = queryArgs ?? {};
        return JSON.stringify({
          categories: args.categories ?? "",
          healthGoal: args.healthGoal ?? "",
          ingredientIds: args.ingredientIds ?? "",
          hasStandupPouch: args.hasStandupPouch === true,
          sortBy: args.sortBy ?? "relevance",
          search: args.search ?? "",
          page: args.page ?? 1,
          limit: args.limit ?? 16,
        });
      },
      providesTags: ["Product"],
    }),

    getProductFilters: builder.query<ProductFiltersResponse, void>({
      query: () => {
        const queryParams = new URLSearchParams();
        queryParams.append("lang", getLanguageCode());
        return `/products/filters?${queryParams.toString()}`;
      },
      providesTags: ["Product"],
    }),

    /**
     * GET ALL PRODUCTS CATEGORIES
     * Fetch list of all products categories
     * Language handling:
     * - If user logged in: language fetched from user/me
     * - If user not logged in: language passed as query parameter
     */
    getCategories: builder.query<GetProductCategoriesResponse, { lang: string }>({
      query: ({ lang }) => `/products/categories?lang=${lang}`,
      providesTags: ["Product"],
    }),

    getProductGoals: builder.query<GetProductGoalsResponse, void>({
      query: () => "/goals",
      providesTags: ["Product"],
    }),

    getProductsPageIngredients: builder.query<
      GetProductIngredientsResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => {
        const page = params?.page ?? 1;
        const limit = params?.limit ?? 20;
        return `/product-ingredients?page=${page}&limit=${limit}`;
      },
      providesTags: ["Product"],
    }),

    /**
     * GET SINGLE PRODUCT
     * Fetch one product by ID
     * Language: `lang` query mirrors UI locale (localStorage), including logged-in users.
     */
    getProductById: builder.query<GetProductByIdResponse, string>({
      query: (id) => {
        const queryParams = new URLSearchParams();
        queryParams.append("lang", getLanguageQueryForApi());
        return `/products/${id}?${queryParams.toString()}`;
      },
      providesTags: (result, error, id) => [{ type: "Product", id }],
    }),

    /**
     * GET PRODUCT TESTIMONIALS
     * Fetch testimonials for a given product ID
     */
    getProductTestimonials: builder.query<any, string | undefined>({
      query: (productId) => {
        if (!productId) return "/product-testimonials";
        const params = new URLSearchParams({ productId });
        return `/product-testimonials?${params.toString()}`;
      },
      providesTags: ["Product"],
    }),

    /**
     * ADD PRODUCT REVIEW
     * Submit a review for a product
     */
    addReview: builder.mutation<void, { productId: string; rating: number; content: string }>({
      query: ({ productId, rating, content }) => ({
        url: `/reviews/products/${productId}`,
        method: "POST",
        body: { rating, content },
      }),
      invalidatesTags: (result, error, { productId }) => [{ type: "Product", id: productId }],
    }),

    getCategoriesWithProducts: builder.query<
      CategoriesWithProductsResponse,
      { lang?: string } | void
    >({
      query: (params) => {
        const qp = new URLSearchParams();
        if (params?.lang) qp.set("lang", params.lang);
        return `/products/categories/list${qp.toString() ? `?${qp}` : ""}`;
      },
      providesTags: ["Product"],
    }),
  }),
});

export const {
  useGetProductsQuery,
  useLazyGetProductsQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useGetCategoriesQuery,
  useLazyGetCategoriesQuery,
  useGetProductGoalsQuery,
  useLazyGetProductGoalsQuery,
  useGetProductsPageIngredientsQuery,
  useLazyGetProductsPageIngredientsQuery,
  useGetProductFiltersQuery,
  useGetProductTestimonialsQuery,
  useGetCategoriesWithProductsQuery,
  useLazyGetCategoriesWithProductsQuery,
  useAddReviewMutation,
} = productApi;
