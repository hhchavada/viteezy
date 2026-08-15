export interface ValidateCouponRequest {
  couponCode: string;
  cartId: string;
  language?: string;
  planDurationDays?: number;
}

export interface CouponData {
  isValid: boolean;
  coupon?: {
    code: string;
    name: {
      en: string;
      nl: string;
    };
    discountType?: "percentage" | "fixed";
    discountValue?: number;
  };
  discountAmount?: number;
  finalAmount?: number;
}

export interface ValidateCouponResponse {
  success: boolean;
  message: string;
  data: CouponData | null;
}
