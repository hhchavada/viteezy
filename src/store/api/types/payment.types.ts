// Payment API Types

export interface CreatePaymentRequest {
    orderId: string;
    paymentMethod: string;
}

export interface Payment {
    _id: string;
    orderId: string;
    paymentMethod: string;
    amount: number;
    currency: string;
    status: string;
    paymentUrl?: string;
    transactionId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface CreatePaymentResponse {
    success: boolean;
    message: string;
    data: {
        payment: Payment;
        paymentUrl?: string;
    };
}

export interface PayAgainRequest {
    orderId: string;
    paymentMethod: string;
    returnUrl: string;
    cancelUrl: string;
}

export interface PayAgainResponse {
    success: boolean;
    message: string;
    data: {
        payment: {
            _id: string;
            orderId: string;
            status: string;
            amount: {
                amount: number;
                currency: string;
                taxRate?: number;
            };
            paymentMethod: string;
            gatewayTransactionId?: string;
        };
        order: {
            _id: string;
            orderNumber: string;
            status: string;
            paymentStatus: string;
            total?: {
                amount: number;
                currency: string;
            };
        };
        gateway: {
            redirectUrl?: string | null;
            clientSecret?: string | null;
            gatewayTransactionId?: string | null;
            sessionId?: string | null;
        };
        abandonedPayments?: number;
    };
}
