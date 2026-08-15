import type { Metadata } from "next";
import RecommendationsPage from "@/components/recommendations";

export const metadata: Metadata = {
  title: "Personalized Recommendations | Viteezy",
  description:
    "View your personalized supplement recommendations based on your health quiz results.",
};

export default function RecommendationPage() {
  return <RecommendationsPage />;
}
