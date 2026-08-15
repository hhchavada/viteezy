interface DraftItem {
    id: string | null;
    value: string;
  }
  
  const DRAFT_KEY = "quiz_draft";
  
  export const quizDraftService = {
    saveDraft({ id, value }: { id: string | null; value: string }): void {
      const existingRaw = localStorage.getItem(DRAFT_KEY);
      const existing: DraftItem[] = existingRaw ? JSON.parse(existingRaw) : [];
  
      const updated = existing.filter((item) => item.id !== id);
      updated.push({ id, value });
  
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
    },
  
    getValue(id: string | null): string | null {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return null;
  
      const list: DraftItem[] = JSON.parse(raw);
      const item = list.find((item) => item.id === id);
      return item ? item.value : null;
    },
  
    clearDraft(id: string | null): void {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
  
      const list: DraftItem[] = JSON.parse(raw);
      const updated = list.filter((item) => item.id !== id);
  
      localStorage.setItem(DRAFT_KEY, JSON.stringify(updated));
    },
  
    clearAll(): void {
      localStorage.removeItem(DRAFT_KEY);
    },
  };