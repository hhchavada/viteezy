import baseApi from "./baseApi";
import {
  GetAddressesResponse,
  CreateAddressRequest,
  CreateAddressResponse,
  UpdateAddressRequest,
  UpdateAddressResponse,
  GetAddressesParams,
} from "./types/addresses.types";

export const addressesApi = baseApi.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getAddresses: builder.query<
      GetAddressesResponse,
      GetAddressesParams | void
    >({
      query: (params) => ({
        url: "addresses",
        params: params ?? {},
      }),
      providesTags: ["Addresses"],
    }),

    createAddress: builder.mutation<
      CreateAddressResponse,
      CreateAddressRequest
    >({
      query: (body) => ({
        url: "addresses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Addresses", "Subscription"],
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          // Add the new address to the cache at the beginning
          dispatch(
            addressesApi.util.updateQueryData(
              "getAddresses",
              undefined,
              (draft) => {
                if (draft?.data?.addresses && data?.data?.address) {
                  // If this address is set as default, set all other addresses to non-default
                  if (data.data.address.isDefault) {
                    draft.data.addresses.forEach((addr) => {
                      addr.isDefault = false;
                    });
                  }
                  // Add new address at the beginning of the array
                  draft.data.addresses.unshift(data.data.address);
                }
              },
            ),
          );
        } catch {
          // Error handling is done by the mutation itself
        }
      },
    }),

    updateAddress: builder.mutation<
      UpdateAddressResponse,
      { id: string; data: UpdateAddressRequest }
    >({
      query: ({ id, data }) => ({
        url: `addresses/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Addresses", "Subscription"],
      async onQueryStarted({ id, data }, { dispatch, queryFulfilled }) {
        try {
          const { data: responseData } = await queryFulfilled;
          // Update the address in the cache
          dispatch(
            addressesApi.util.updateQueryData(
              "getAddresses",
              undefined,
              (draft) => {
                if (draft?.data?.addresses && responseData?.data?.address) {
                  // If this address is being set as default, set all other addresses to non-default
                  if (data.isDefault === true) {
                    draft.data.addresses.forEach((addr) => {
                      if (addr._id !== id) {
                        addr.isDefault = false;
                      }
                    });
                  }

                  const index = draft.data.addresses.findIndex(
                    (addr) => addr._id === id,
                  );
                  if (index !== -1) {
                    draft.data.addresses[index] = responseData.data.address;
                  }
                }
              },
            ),
          );
        } catch {
          // Error handling is done by the mutation itself
        }
      },
    }),

    deleteAddress: builder.mutation({
      query: (addressId: string) => ({
        url: `addresses/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Addresses", "Subscription"],
      async onQueryStarted(addressId, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          addressesApi.util.updateQueryData(
            "getAddresses",
            undefined,
            (draft) => {
              if (draft?.data?.addresses) {
                draft.data.addresses = draft.data.addresses.filter(
                  (address) => address._id !== addressId,
                );
              }
            },
          ),
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),
  }),
});

export const {
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = addressesApi;
