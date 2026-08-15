import { FAQArticle } from "./types";

export const faqArticles: FAQArticle[] = [
  {
    id: "1",
    title: "Your Viteezy package around the holidays",
    description:
      "Please note! If you place a new order between December 23rd and January 2nd, it may take longer than four business days for your package to arrive due to the holidays and busy times at PostNL. If you expect your new Viteezy vitamin...",
    content: [
      "Please note! If you place a new order between December 23rd and January 2nd, it may take longer than 4 business days for your package to arrive due to the holidays and busy times at PostNL.",
      "Are you expecting your new Viteezy vitamin package between now and are you subconsciously worried about the delivery? No worries! Send a message to info@vitezy.nl and we'll help you!",
      "Please note that we will not be available to answer your questions by email or phone on Monday, December 25th, Tuesday, December 26th, and Monday, January 1st. We aim to answer all questions within 24 hours on December 27th and January 2nd.",
      "On behalf of Viteezy, we wish you a very happy holiday season and, of course, a happy and healthy new year! 🎄💚",
    ],
    categorySlug: "shipping-delivery-returns",
    updatedAt: "9 months ago",
  },
  {
    id: "2",
    title: "When will I receive my next delivery?",
    description:
      "All subsequent deliveries will be delivered automatically when your vitamins are running low, which is around the same date each month. If you'd like to receive your vitamins sooner, or perhaps pause for a while, you can arrange this yourself.",
    content: [
      "All subsequent deliveries will be delivered automatically when your vitamins are running low, which is around the same date each month.",
      "If you'd like to receive your vitamins sooner, or perhaps pause for a while, you can arrange this yourself through your account dashboard.",
      "You can modify your delivery schedule at any time by logging into your account and adjusting your subscription settings.",
    ],
    categorySlug: "shipping-delivery-returns",
    updatedAt: "2 months ago",
  },
  {
    id: "3",
    title: "Can I choose a PostNL point for my delivery?",
    description:
      "It's currently not possible to choose a PostNL delivery point when placing your order at Viteezy. We deliver packages to your home within 2-4 business days, unless no one is available to accept the package. In that case, the...",
    content: [
      "It's currently not possible to choose a PostNL delivery point when placing your order at Viteezy.",
      "We deliver packages to your home within 2-4 business days, unless no one is available to accept the package.",
      "In that case, the carrier will leave a notice and you can arrange for redelivery or pick it up from a local depot.",
    ],
    categorySlug: "shipping-delivery-returns",
    updatedAt: "5 months ago",
  },
  {
    id: "4",
    title: "I want to cancel my order. Is this possible?",
    description:
      "Want to cancel a recently placed order? To get your package to you as quickly as possible and due to the personalized production process, your package goes into production fairly quickly after you order it. When the package is in...",
    content: [
      "Want to cancel a recently placed order? To get your package to you as quickly as possible and due to the personalized production process, your package goes into production fairly quickly after you order it.",
      "When the package is in production, it cannot be cancelled. However, if you contact us within 24 hours of placing your order, we may be able to cancel it.",
      "For subscription orders, you can cancel or modify your subscription at any time through your account dashboard.",
    ],
    categorySlug: "shipping-delivery-returns",
    updatedAt: "3 months ago",
  },
  {
    id: "5",
    title: "How long does shipping take?",
    description:
      "Standard shipping typically takes 2-4 business days. Express shipping options are available at checkout for faster delivery. International shipping times may vary based on your location.",
    content: [
      "Standard shipping typically takes 2-4 business days.",
      "Express shipping options are available at checkout for faster delivery.",
      "International shipping times may vary based on your location.",
    ],
    categorySlug: "shipping-delivery-returns",
    updatedAt: "1 month ago",
  },
  {
    id: "6",
    title: "What is your return policy?",
    description:
      "We offer a 30-day money-back guarantee on all products. If you're not satisfied with your purchase, you can return it within 30 days for a full refund. Items must be unopened and in original packaging.",
    content: [
      "We offer a 30-day money-back guarantee on all products.",
      "If you're not satisfied with your purchase, you can return it within 30 days for a full refund.",
      "Items must be unopened and in original packaging.",
    ],
    categorySlug: "shipping-delivery-returns",
    updatedAt: "6 months ago",
  },
];

export const getArticlesByCategory = (categorySlug: string): FAQArticle[] => {
  return faqArticles.filter((article) => article.categorySlug === categorySlug);
};

export const getArticleById = (
  categorySlug: string,
  articleId: string
): FAQArticle | undefined => {
  return faqArticles.find(
    (article) =>
      article.categorySlug === categorySlug && article.id === articleId
  );
};

