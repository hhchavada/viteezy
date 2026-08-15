import { baseApi } from "./baseApi";
import type {
  GetStaticPageResponse,
  GetStaticPagesListResponse,
} from "./types/staticPage.types";

export interface GetStaticPageArg {
  slug: string;
  lang: string;
}

export interface GetStaticPagesListArg {
  lang: string;
}

export const staticPagesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStaticPage: builder.query<GetStaticPageResponse, GetStaticPageArg>({
      query: ({ slug, lang }) => ({
        url: `/static-pages/${encodeURIComponent(slug)}`,
        params: { lang },
      }),
    }),
    getStaticPages: builder.query<
      GetStaticPagesListResponse,
      GetStaticPagesListArg
    >({
      query: ({ lang }) => ({
        url: "/static-pages",
        params: { lang },
      }),
    }),
  }),
});

export const {
  useGetStaticPageQuery,
  useLazyGetStaticPageQuery,
  useGetStaticPagesQuery,
} = staticPagesApi;
