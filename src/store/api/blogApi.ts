import { baseApi } from "./baseApi";
import type {
    GetBlogsResponse,
    GetCategoriesResponse,
    GetPopularBlogsResponse,
    GetBlogByIdResponse,
} from "./types/blog.types";
import { getLanguageQueryForApi } from "@/lib/services/language";

export const blogApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * GET ALL BLOGS
         * Language: `lang` query mirrors UI locale (localStorage), including logged-in users.
         */
        getBlogs: builder.query<
            GetBlogsResponse,
            { category?: string; page?: number; limit?: number } | void
        >({
            query: (params) => {
                const queryParams = new URLSearchParams();

                const lang = getLanguageQueryForApi();
                queryParams.append("lang", lang);

                if (params?.category) {
                    queryParams.append("category", params.category);
                }
                if (params?.page) {
                    queryParams.append("page", params.page.toString());
                }
                if (params?.limit) {
                    queryParams.append("limit", params.limit.toString());
                }
                return `/blogs${queryParams.toString() ? `?${queryParams.toString()}` : ""
                    }`;
            },
            providesTags: ["Blog"],
        }),

        /**
         * GET ALL BLOG CATEGORIES
         * Language: `lang` query mirrors UI locale (localStorage), including logged-in users.
         */
        getBlogCategories: builder.query<GetCategoriesResponse, void>({
            query: () => {
                const queryParams = new URLSearchParams();

                const lang = getLanguageQueryForApi();
                queryParams.append("lang", lang);

                return `/blogs/categories/list${queryParams.toString() ? `?${queryParams.toString()}` : ""
                    }`;
            },
            providesTags: ["Blog"],
        }),

        /**
         * GET SINGLE BLOG
         * Language: `lang` query mirrors UI locale (localStorage), including logged-in users.
         */
        getBlogById: builder.query<GetBlogByIdResponse, string>({
            query: (id) => {
                const queryParams = new URLSearchParams();

                const lang = getLanguageQueryForApi();
                queryParams.append("lang", lang);

                return `/blogs/${id}${queryParams.toString() ? `?${queryParams.toString()}` : ""
                    }`;
            },
            providesTags: (result, error, id) => [{ type: "Blog", id }],
        }),

        /**
         * GET POPULAR/TRENDING BLOGS
         * Language: `lang` query mirrors UI locale (localStorage), including logged-in users.
         */
        getPopularBlogs: builder.query<GetPopularBlogsResponse, void>({
            query: () => {
                const queryParams = new URLSearchParams();

                const lang = getLanguageQueryForApi();
                queryParams.append("lang", lang);

                return `/blogs/popular/list${queryParams.toString() ? `?${queryParams.toString()}` : ""
                    }`;
            },
            providesTags: ["Blog"],
        }),
    }),
});

export const {
    useGetBlogsQuery,
    useGetBlogCategoriesQuery,
    useGetBlogByIdQuery,
    useGetPopularBlogsQuery,
} = blogApi;
