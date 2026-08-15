import type { Metadata } from "next";
import QuizQuestions from "@/components/quiz/QuizQuestions";

export const metadata: Metadata = {
  title: "Health Quiz | Viteezy",
  description: "Answer a few questions to get your personalized vitamin recommendation.",
};

export default function QuizQuestionsPage() {
  return <QuizQuestions />;
}
