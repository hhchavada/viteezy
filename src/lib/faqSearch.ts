import type { FaqCategory, FaqItem } from "@/store/api/types/faq.types";

const normalize = (s: string) => s.trim().toLowerCase();

const faqMatchesQuery = (faq: FaqItem, q: string): boolean =>
  normalize(faq.question).includes(q) || normalize(faq.answer).includes(q);

/**
 * Filters FAQ categories and their faqs by a search query (local, no API).
 * Matches: category title, question, or answer.
 * If category title matches, all its faqs are kept; otherwise only faqs matching question/answer.
 */
export function filterFaqCategoriesByQuery(
  categories: FaqCategory[],
  query: string
): FaqCategory[] {
  const q = normalize(query);
  if (!q) return categories;

  const result: FaqCategory[] = [];

  for (const cat of categories) {
    const titleMatches = normalize(cat.categoryTitle).includes(q);
    const faqs = cat.faqs ?? [];
    const filteredFaqs = titleMatches
      ? faqs
      : faqs.filter((f) => faqMatchesQuery(f, q));

    if (filteredFaqs.length > 0) {
      result.push({ ...cat, faqs: filteredFaqs });
    }
  }

  return result;
}

/**
 * Filters a single category's faqs by query (question/answer match).
 */
export function filterFaqsByQuery(
  faqs: FaqItem[],
  query: string
): FaqItem[] {
  const q = normalize(query);
  if (!q) return faqs;
  return faqs.filter((f) => faqMatchesQuery(f, q));
}
