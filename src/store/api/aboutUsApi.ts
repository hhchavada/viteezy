import baseApi from "./baseApi";
import { GetAboutUsResponse } from "./types/aboutUs.types";

export interface GetAboutUsByLangArg {
  lang: string;
}

export const aboutUsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAboutUs: builder.query<GetAboutUsResponse, GetAboutUsByLangArg>({
      query: (params) => `about-us?lang=${params.lang}`,
    }),
  }),
});

export const { useGetAboutUsQuery } = aboutUsApi;


