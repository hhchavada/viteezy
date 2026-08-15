/** Order paymentStatus values from GET /orders and GET /orders/:id */
export const ORDER_PAYMENT_STATUS = {
  PENDING: "Pending",
  PROCESSING: "Processing",
  COMPLETED: "Completed",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
  REFUNDED: "Refunded",
} as const;

export type OrderPaymentStatus =
  (typeof ORDER_PAYMENT_STATUS)[keyof typeof ORDER_PAYMENT_STATUS];

const PAYMENT_STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-blue-50 text-blue-700 border-blue-200",
  completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
  failed: "bg-red-50 text-red-700 border-red-200",
  cancelled: "bg-gray-50 text-gray-600 border-gray-200",
  refunded: "bg-teal-50 text-teal-700 border-teal-200",
};

const PAYMENT_STATUS_DOT_STYLES: Record<string, string> = {
  pending: "bg-amber-500",
  processing: "bg-blue-500",
  completed: "bg-emerald-500",
  failed: "bg-red-500",
  cancelled: "bg-gray-400",
  refunded: "bg-teal-500",
};

const PAYMENT_STATUS_LABEL_KEYS: Record<
  string,
  | "paymentStatusPending"
  | "paymentStatusProcessing"
  | "paymentStatusCompleted"
  | "paymentStatusFailed"
  | "paymentStatusCancelled"
  | "paymentStatusRefunded"
> = {
  pending: "paymentStatusPending",
  processing: "paymentStatusProcessing",
  completed: "paymentStatusCompleted",
  failed: "paymentStatusFailed",
  cancelled: "paymentStatusCancelled",
  refunded: "paymentStatusRefunded",
};

export function getPaymentStatusStyle(status?: string | null): string {
  const key = (status || "").trim().toLowerCase();
  return (
    PAYMENT_STATUS_STYLES[key] || "bg-gray-50 text-gray-700 border-gray-200"
  );
}

export function getPaymentStatusDotStyle(status?: string | null): string {
  const key = (status || "").trim().toLowerCase();
  return PAYMENT_STATUS_DOT_STYLES[key] || "bg-gray-400";
}

export function getPaymentStatusLabelKey(
  status?: string | null
): (typeof PAYMENT_STATUS_LABEL_KEYS)[string] | null {
  const key = (status || "").trim().toLowerCase();
  return PAYMENT_STATUS_LABEL_KEYS[key] ?? null;
}
