import { baseApi } from "./baseApi";
import type {
  GetHeaderBannerResponse,
  GetHeaderBannerParams,
} from "./types/headerBanner.types";

export const headerBannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getHeaderBanner: builder.query<
      GetHeaderBannerResponse,
      GetHeaderBannerParams
    >({
      query: ({ deviceType, lang }) => ({
        url: "/header-banner",
        params: { deviceType, lang },
      }),
    }),
  }),
});

export const { useGetHeaderBannerQuery } = headerBannerApi;
