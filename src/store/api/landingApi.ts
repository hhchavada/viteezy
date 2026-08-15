import baseApi from "./baseApi";
import { ApiResponse } from "./types/common.types";
import { LandingPageResponse } from "./types/landing.types";
import { getLanguageQueryForApi } from "@/lib/services/language";

export const landingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLandingPageData: builder.query<ApiResponse<LandingPageResponse>, void>({
      query: () => {
        const queryParams = new URLSearchParams();

        const lang = getLanguageQueryForApi();
        queryParams.append("lang", lang);

        return `/landing-page${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      },
    }),
  }),
});

export const { useGetLandingPageDataQuery } = landingApi;
