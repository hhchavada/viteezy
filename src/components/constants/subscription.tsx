export const subscriptionStatus = {
  active: "Active",
  cancelled: "Cancelled",
};

/** Shared badge class for subscription status (Active, Cancelled, Paused) - use in plan history and subscription cards */
export const subscriptionStatusBadgeClass: Record<string, string> = {
  Active: "bg-light-mint text-aqua-deep",
  Cancelled: "bg-coral-red text-white",
  Paused: "bg-amber-500 text-white",
};
