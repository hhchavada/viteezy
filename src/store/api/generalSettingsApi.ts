import { baseApi } from "./baseApi";
import type { GetGeneralSettingsResponse } from "./types/generalSettings.types";

export interface GetGeneralSettingsArg {
  lang: string;
}

export const generalSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getGeneralSettings: builder.query<GetGeneralSettingsResponse, GetGeneralSettingsArg>({
      query: ({ lang }) => ({
        url: "/general-settings",
        params: { lang },
      }),
    }),
  }),
});

export const {
  useGetGeneralSettingsQuery,
  useLazyGetGeneralSettingsQuery,
} = generalSettingsApi;
