import type { Metadata } from "next";
import QuizStartPage from "@/components/quiz";

export const metadata: Metadata = {
  title: "Health Quiz | Viteezy",
  description:
    "Take our personalized health quiz to discover vitamins tailored for your wellness goals. It only takes 3–5 minutes.",
};

export default function QuizPage() {
  return <QuizStartPage />;
}
