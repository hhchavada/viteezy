import baseApi from "./baseApi";
import {
    GetMembershipPlansResponse,
    BuyMembershipRequest,
    BuyMembershipResponse,
    GetUserMembershipsRequest,
    GetUserMembershipsResponse,
} from "./types/membership.types";

export const membershipApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMembershipPlans: builder.query<GetMembershipPlansResponse, void>({
            query: () => "/memberships/plans",
            providesTags: ["Membership"],
        }),
        getUserMemberships: builder.query<GetUserMembershipsResponse, GetUserMembershipsRequest>({
            query: ({ page = 1, limit = 10 }) => ({
                url: "/memberships",
                params: { page, limit },
            }),
            providesTags: ["Membership"],
        }),
        buyMembership: builder.mutation<BuyMembershipResponse, BuyMembershipRequest>({
            query: (body) => ({
                url: "/memberships/buy",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Membership"],
        }),
    }),
});

export const { useGetMembershipPlansQuery, useBuyMembershipMutation, useGetUserMembershipsQuery } =
    membershipApi;
