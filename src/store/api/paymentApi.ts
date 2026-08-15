import { baseApi } from "./baseApi";
import type {
    CreatePaymentRequest,
    CreatePaymentResponse,
    PayAgainRequest,
    PayAgainResponse,
} from "./types/payment.types";

export const paymentApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * CREATE PAYMENT
         * Create a payment for an order
         */
        createPayment: builder.mutation<CreatePaymentResponse, CreatePaymentRequest>({
            query: (body) => ({
                url: "/payments/create",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Order"],
        }),

        /**
         * PAY AGAIN
         * Resume payment for a pending / unpaid order
         */
        payAgain: builder.mutation<PayAgainResponse, PayAgainRequest>({
            query: (body) => ({
                url: "/payments/pay-again",
                method: "POST",
                body,
            }),
            invalidatesTags: ["Order"],
        }),
    }),
});

export const {
    useCreatePaymentMutation,
    usePayAgainMutation,
} = paymentApi;
