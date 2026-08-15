import { routes } from "./route";

const base = routes.account;

export const accountRoute = {
  account: base,
  profile: base + "?tab=profile",
  orders: base + "?tab=orders",
  favorites: base + "?tab=favorites",
  subscribe: base + "?tab=subscribe",
  addresses: base + "?tab=addresses",
};

export const accountTabs = [
  { id: "profile", href: accountRoute.profile },
  { id: "addresses", href: accountRoute.addresses },
  { id: "orders", href: accountRoute.orders },
  { id: "favorites", href: accountRoute.favorites },
];

export const settingsTabs = [
  { id: "subscribe", href: "/settings?tab=subscribe" },
  { id: "membership", href: "/settings?tab=membership" },
  { id: "sub-members", href: "/settings?tab=sub-members" },
  { id: "change-password", href: "/settings?tab=change-password" },
];
