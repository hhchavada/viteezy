import baseApi from "./baseApi";
import {
  GetTeamMembersResponse,
  GetTeamMembersParams,
} from "./types/team.types";

export const teamApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTeamMembers: builder.query<
      GetTeamMembersResponse,
      GetTeamMembersParams | void
    >({
      query: (params) => ({
        url: "our-team-page",
        params: params ? { lang: params.lang } : undefined,
      }),
    }),
  }),
});

export const { useGetTeamMembersQuery, useLazyGetTeamMembersQuery } = teamApi;
