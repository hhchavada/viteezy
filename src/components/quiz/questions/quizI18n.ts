export type QuizMessageTranslator = (
  key: string,
  values?: Record<string, string | number>
) => string;
