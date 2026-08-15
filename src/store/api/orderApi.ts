import { baseApi } from "./baseApi";
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  GetOrdersResponse,
  GetOrderByIdResponse,
} from "./types/order.types";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    /**
     * GET ORDERS
     * Fetch all orders for the current user
     */
    getOrders: builder.query<GetOrdersResponse, void>({
      query: () => "/orders",
      providesTags: ["Order"],
    }),

    /**
     * GET ORDER BY ID
     * Fetch a single order by ID
     */
    getOrderById: builder.query<GetOrderByIdResponse, string>({
      query: (orderId) => `/orders/${orderId}`,
      providesTags: ["Order"],
    }),

    /**
     * CREATE ORDER
     * Create a new order with the specified details
     */
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (body) => ({
        url: "/orders",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order", "Cart"],
    }),
  }),
});

export const {
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useLazyGetOrderByIdQuery,
  useCreateOrderMutation,
} = orderApi;
