export interface FAQCategory {
  id: string;
  title: string;
  articleCount: number;
  slug: string;
  img: string;
}

export const faqCategories: FAQCategory[] = [
  {
    id: "1",
    title: "Shipping, delivery and returns",
    articleCount: 12,
    slug: "shipping-delivery-returns",
    img: "/faq/faq1.png",
  },
  {
    id: "2",
    title: "Tips & Tricks",
    articleCount: 49,
    slug: "tips-tricks",
    img: "/faq/faq2.png",
  },
  {
    id: "3",
    title: "Order",
    articleCount: 23,
    slug: "order",
    img: "/faq/faq3.png",
  },
  {
    id: "4",
    title: "About our Vitamins",
    articleCount: 38,
    slug: "about-vitamins",
    img: "/faq/faq4.png",
  },
  {
    id: "5",
    title: "Your Vitamin Plan, Membership & Account",
    articleCount: 25,
    slug: "membership-account",
    img: "/faq/faq5.png",
  },
  {
    id: "6",
    title: "How does Viteezy work",
    articleCount: 7,
    slug: "how-viteezy-works",
    img: "/faq/faq6.png",
  },
];
