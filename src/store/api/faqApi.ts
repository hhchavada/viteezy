import baseApi from "./baseApi";
import { GetFaqsResponse } from "./types/faq.types";

export interface GetFaqsByLangArg {
  lang: string;
}

export const faqApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * POST FAQs
     * POST /faqs with body { lang }
     * Returns FAQs by language (categories with faqs).
     */
    getFaqsByLang: builder.query<GetFaqsResponse, GetFaqsByLangArg>({
      query: (body) => ({
        url: "/faqs",
        method: "POST",
        body,
      }),
      providesTags: ["FAQ"],
    }),
  }),
});

export const { useGetFaqsByLangQuery, useLazyGetFaqsByLangQuery } = faqApi;
