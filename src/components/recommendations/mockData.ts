import type {
  AddOnProduct,
  MembershipOption,
  OrderLineItem,
  Supplement,
} from "@/types/recommendations";

const PRODUCT_IMAGE = "";

export const essentialSupplements: Supplement[] = [
  {
    id: "energy-assistant",
    name: "Energy Assistant",
    imageUrl: PRODUCT_IMAGE,
    goalLabel: "Goal-Required",
    pillsCount: 4,
    originalPrice: 13,
    currentPrice: 11,
    dosage: 2,
  },
  {
    id: "stress-less",
    name: "Stress-Less",
    imageUrl: PRODUCT_IMAGE,
    goalLabel: "Goal-Required",
    pillsCount: 4,
    originalPrice: 13,
    currentPrice: 11,
    dosage: 2,
  },
  {
    id: "vitamin-d3-k2",
    name: "Vitamin D3 + K2",
    imageUrl: PRODUCT_IMAGE,
    goalLabel: "Goal-Required",
    pillsCount: 4,
    originalPrice: 13,
    currentPrice: 11,
    dosage: 2,
    disabled: true,
  },
  {
    id: "omega-complex",
    name: "Omega Complex",
    imageUrl: PRODUCT_IMAGE,
    goalLabel: "Goal-Required",
    pillsCount: 4,
    originalPrice: 13,
    currentPrice: 11,
    dosage: 2,
  },
];

export const membershipOptions: MembershipOption[] = [
  {
    id: "quarterly",
    name: "Quarterly Basic",
    label: "Quarterly",
    badge: "Save 15%",
    price: 85.0,
    currency: "EUR",
    active: true,
    action: "remove",
  },
  {
    id: "annual",
    name: "Annual Plan",
    label: "Annual",
    badge: "Save 30% Best Value",
    price: 100.0,
    currency: "EUR",
    action: "add",
    isBestValue: true,
  },
];

export const membershipSection = {
  title: "Add Membership",
  subtitle: "Longer commitments unlock better pricing and premium perks.",
  hasActiveMembership: false,
  activeMembership: null,
  plans: membershipOptions,
};

export const orderLineItems: OrderLineItem[] = [
  { label: "Subtotal", value: "$80" },
  { label: "Shipping", value: "Free" },
  { label: "Membership Discount", value: "- $5.58" },
  { label: "Sales Tax", value: "Calc. at checkout" },
  { label: "Total", value: "$81", variant: "total" },
];

export const addOnProducts: AddOnProduct[] = [
  {
    id: "energy-bundle-1",
    name: "Energy Bundle",
    description: "Astaxanthin - 30 capsules",
    price: 15.22,
    currency: "EUR",
    imageUrl: PRODUCT_IMAGE,
  },
  {
    id: "energy-bundle-2",
    name: "Energy Bundle",
    description: "Astaxanthin - 30 capsules",
    price: 15.22,
    currency: "EUR",
    imageUrl: PRODUCT_IMAGE,
  },
  {
    id: "energy-bundle-3",
    name: "Energy Bundle",
    description: "Astaxanthin - 30 capsules",
    price: 15.22,
    currency: "EUR",
    imageUrl: PRODUCT_IMAGE,
  },
];
