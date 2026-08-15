import type {
  QuizDatePickerConfig,
  QuizQuestion,
} from "@/store/api/types/healthQuiz.types";
import type { QuizMessageTranslator } from "./quizI18n";

export interface ParsedDateParts {
  year: string;
  month: string;
  day: string;
}

export interface DateValidationResult {
  valid: boolean;
  error: string | null;
  normalized: string | null;
}

const MIN_YEAR = 1950;

export function getDefaultDatePickerConfig(): QuizDatePickerConfig {
  return {
    allowDay: true,
    allowMonth: true,
    allowYear: true,
  };
}

export function resolveDatePickerConfig(
  question: QuizQuestion
): QuizDatePickerConfig {
  return question.datePickerConfig ?? getDefaultDatePickerConfig();
}

export function parseDateValue(
  value: string,
  config: QuizDatePickerConfig = getDefaultDatePickerConfig()
): ParsedDateParts {
  const segments = value.split("-");
  const result: ParsedDateParts = { year: "", month: "", day: "" };
  let index = 0;

  if (config.allowYear) {
    result.year = segments[index++] ?? "";
  }
  if (config.allowMonth) {
    result.month = segments[index++] ?? "";
  }
  if (config.allowDay) {
    result.day = segments[index++] ?? "";
  }

  return result;
}

export function buildRawDateValue(
  parts: ParsedDateParts,
  config: QuizDatePickerConfig
): string {
  const segments: string[] = [];

  if (config.allowYear) segments.push(parts.year);
  if (config.allowMonth) segments.push(parts.month);
  if (config.allowDay) segments.push(parts.day);

  return segments.join("-");
}

export function buildDateValue(
  parts: ParsedDateParts,
  config: QuizDatePickerConfig
): string {
  const segments: string[] = [];

  if (config.allowYear && parts.year) {
    segments.push(parts.year.padStart(4, "0").slice(0, 4));
  }
  if (config.allowMonth && parts.month) {
    segments.push(parts.month.padStart(2, "0").slice(0, 2));
  }
  if (config.allowDay && parts.day) {
    segments.push(parts.day.padStart(2, "0").slice(0, 2));
  }

  return segments.join("-");
}

export function sanitizeDigits(value: string, maxLength: number): string {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

export function getDaysInMonth(year: number, month: number): number {
  if (!year || !month) return 31;
  return new Date(year, month, 0).getDate();
}

export function getYearOptions(): string[] {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: currentYear - MIN_YEAR + 1 }, (_, index) =>
    String(currentYear - index)
  );
}

export function getMonthOptions(): string[] {
  return Array.from({ length: 12 }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );
}

export function getDayOptions(year: string, month: string): string[] {
  const yearNum = Number(year);
  const monthNum = Number(month);
  const maxDay =
    yearNum && monthNum ? getDaysInMonth(yearNum, monthNum) : 31;

  return Array.from({ length: maxDay }, (_, index) =>
    String(index + 1).padStart(2, "0")
  );
}

function buildRequiredDateError(
  config: QuizDatePickerConfig,
  t?: QuizMessageTranslator
): string {
  const msg = (key: string) => t?.(key) ?? key;
  const fields: Array<"year" | "month" | "day"> = [];

  if (config.allowYear) fields.push("year");
  if (config.allowMonth) fields.push("month");
  if (config.allowDay) fields.push("day");

  if (fields.length === 1) {
    if (fields[0] === "year") return msg("dateEnterYear");
    if (fields[0] === "month") return msg("dateEnterMonth");
    return msg("dateEnterDay");
  }

  if (fields.length === 2) {
    const [first, second] = fields;
    if (first === "year" && second === "month") return msg("dateEnterYearAndMonth");
    if (first === "year" && second === "day") return msg("dateEnterYearAndDay");
    return msg("dateEnterMonthAndDay");
  }

  return msg("dateEnterComplete");
}

function validateFutureDate(
  parts: ParsedDateParts,
  config: QuizDatePickerConfig,
  t?: QuizMessageTranslator
): string | null {
  const msg = (key: string) => t?.(key) ?? key;
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const currentDay = now.getDate();

  if (config.allowYear) {
    const yearNum = Number(parts.year);
    if (yearNum > currentYear) {
      return config.allowMonth || config.allowDay
        ? msg("dateFutureDate")
        : msg("dateFutureYear");
    }
  }

  if (config.allowYear && config.allowMonth) {
    const yearNum = Number(parts.year);
    const monthNum = Number(parts.month);

    if (yearNum === currentYear && monthNum > currentMonth) {
      return msg("dateFutureDate");
    }
  }

  if (config.allowYear && config.allowMonth && config.allowDay) {
    const yearNum = Number(parts.year);
    const monthNum = Number(parts.month);
    const dayNum = Number(parts.day);
    const date = new Date(yearNum, monthNum - 1, dayNum);

    if (date > now) {
      return msg("dateFutureDate");
    }
  }

  return null;
}

export function validateDateAnswer(
  question: QuizQuestion,
  value: string,
  t?: QuizMessageTranslator
): DateValidationResult {
  const msg = (key: string, values?: Record<string, string | number>) =>
    t?.(key, values) ?? key;
  const config = resolveDatePickerConfig(question);
  const parts = parseDateValue(value, config);
  const { year, month, day } = parts;
  const hasAnyInput = Boolean(year || month || day);
  const isRequired = question.isRequired !== false;

  if (!hasAnyInput) {
    if (!isRequired) {
      return { valid: true, error: null, normalized: null };
    }

    return {
      valid: false,
      error: buildRequiredDateError(config, t),
      normalized: null,
    };
  }

  if (config.allowYear) {
    if (!year) {
      return { valid: false, error: msg("dateEnterYear"), normalized: null };
    }

    if (year.length < 4) {
      return {
        valid: false,
        error: msg("dateInvalidYearLength"),
        normalized: null,
      };
    }
  }

  if (config.allowMonth) {
    if (!month) {
      return { valid: false, error: msg("dateEnterMonth"), normalized: null };
    }

    const monthNum = Number(month);
    if (monthNum < 1 || monthNum > 12) {
      return {
        valid: false,
        error: msg("dateInvalidMonth"),
        normalized: null,
      };
    }
  }

  if (config.allowDay) {
    if (!day) {
      return { valid: false, error: msg("dateEnterDay"), normalized: null };
    }
  }

  const yearNum = config.allowYear ? Number(year) : new Date().getFullYear();
  const monthNum = config.allowMonth ? Number(month) : 1;
  const dayNum = config.allowDay ? Number(day) : 1;
  const currentYear = new Date().getFullYear();

  if (config.allowYear && (yearNum < MIN_YEAR || yearNum > currentYear)) {
    return {
      valid: false,
      error: msg("dateYearOutOfRange", { min: MIN_YEAR, max: currentYear }),
      normalized: null,
    };
  }

  if (config.allowDay) {
    const maxDay = getDaysInMonth(yearNum, monthNum);

    if (dayNum < 1 || dayNum > maxDay) {
      return {
        valid: false,
        error: msg("dateInvalidDayForMonth", { max: maxDay }),
        normalized: null,
      };
    }

    const date = new Date(yearNum, monthNum - 1, dayNum);
    const isRealDate =
      date.getFullYear() === yearNum &&
      date.getMonth() === monthNum - 1 &&
      date.getDate() === dayNum;

    if (!isRealDate) {
      return {
        valid: false,
        error: msg("dateInvalidDate"),
        normalized: null,
      };
    }
  }

  const futureError = validateFutureDate(parts, config, t);
  if (futureError) {
    return {
      valid: false,
      error: futureError,
      normalized: null,
    };
  }

  return {
    valid: true,
    error: null,
    normalized: buildDateValue(parts, config),
  };
}
