import baseApi from "./baseApi";
import {
    GetFamilyMembersResponse,
} from "./types/familyMember.types";

export const familyMemberApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getFamilyMembers: builder.query<GetFamilyMembersResponse, void>({
            query: () => "/users/family/sub-members",
            providesTags: ["FamilyMember"],
        }),
        removeFamilyMember: builder.mutation<void, string>({
            query: (id) => ({
                url: `/users/family/remove/${id}`,
                method: "DELETE",
            }),
        }),
    }),
});

export const { useGetFamilyMembersQuery, useRemoveFamilyMemberMutation } = familyMemberApi;
