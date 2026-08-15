// ============================================================
// Contact API Types
// ============================================================

/**
 * Request payload for submitting contact form
 */
export interface ContactRequest {
    subject: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    privacyAccepted: boolean;
}

/**
 * Request payload for footer subscription
 */
export interface FooterSubscribeRequest {
    email: string;
}

/**
 * Response from contact form submission
 */
export interface ContactResponse {
    success: boolean;
    message: string;
    data?: any;
}

/**
 * Response from footer subscription
 */
export interface FooterSubscribeResponse {
    success: boolean;
    message: string;
    data?: any;
}
