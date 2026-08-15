export const quizStartImages = {
  girl: "/quiz/1st.png",
  productTin: "/quiz/2nd.png",
  sachet: "/quiz/3rd.png",
  energyPouch: "/quiz/4th.png",
} as const;

export const quizStartDefaults = {
  title: "Let's get started with your health quiz.",
  subtitle: "It will take 3–5 minutes",
  ctaButton: "Take the Quiz",
} as const;

export const quizCardSizes = {
  girl: { maxWidth: 242, maxHeight: 263 },
  productTin: { maxWidth: 353, maxHeight: 254 },
  sachet: { maxWidth: 242, maxHeight: 197 },
  energyPouch: { maxWidth: 242, maxHeight: 263 },
} as const;

export type QuizCardSizeKey = keyof typeof quizCardSizes;
