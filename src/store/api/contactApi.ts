import { baseApi } from "./baseApi";
import type { 
    ContactRequest, 
    ContactResponse, 
    FooterSubscribeRequest, 
    FooterSubscribeResponse 
} from "./types/contact.types";

// ============================================================
// Contact API Endpoints
// ============================================================

export const contactApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        /**
         * SUBMIT CONTACT FORM
         * Send contact form data to the server
         */
        submitContactForm: builder.mutation<ContactResponse, ContactRequest>({
            query: (contactData) => ({
                url: "/contact",
                method: "POST",
                body: contactData,
            }),
        }),

        /**
         * FOOTER SUBSCRIBE
         * Subscribe to newsletter from footer
         */
        footerSubscribe: builder.mutation<FooterSubscribeResponse, FooterSubscribeRequest>({
            query: (subscribeData) => ({
                url: "/contact/footer-subscribe",
                method: "POST",
                body: subscribeData,
            }),
        }),
    }),
});

// Export hooks for usage in components
export const { useSubmitContactFormMutation, useFooterSubscribeMutation } = contactApi;
