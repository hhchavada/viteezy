/**
 * Normalizes API error payloads (e.g. RTK Query `unwrap()` rejections where
 * `error.data` is the JSON body).
 */

export type ApiFieldError = {
  field?: string;
  message?: string;
  value?: unknown;
};

export type ApiErrorBody = {
  success?: boolean;
  message?: string;
  errorType?: string;
  error?: string;
  data?: unknown;
  errors?: ApiFieldError[];
};

export type GetApiErrorOptionsSingle = {
  mode?: "single";
  /** Used when no message could be parsed from the payload */
  fallback?: string;
  /** When several field errors exist, combine them into one string (e.g. toast) */
  joinSeparator?: string;
};

export type GetApiErrorOptionsMultiple = {
  mode: "multiple";
  fallback?: string;
};

export type GetApiErrorOptions =
  | GetApiErrorOptionsSingle
  | GetApiErrorOptionsMultiple;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Prefer RTK-style `{ data: body }`, otherwise treat `error` as the body itself */
export function getApiErrorBody(error: unknown): ApiErrorBody | undefined {
  if (!isRecord(error)) return undefined;
  if ("data" in error && isRecord(error.data)) {
    return error.data as ApiErrorBody;
  }
  return error as ApiErrorBody;
}

/**
 * Collects human-readable messages from a parsed API error body.
 * Prefers `errors[].message`, then `error`, then `message`.
 */
export function collectApiErrorMessages(body: ApiErrorBody | undefined): string[] {
  if (!body) return [];

  const fromFields: string[] = [];
  if (Array.isArray(body.errors)) {
    for (const item of body.errors) {
      if (!item || typeof item.message !== "string") continue;
      const m = item.message.trim();
      if (m) fromFields.push(m);
    }
  }
  if (fromFields.length > 0) return fromFields;

  if (typeof body.error === "string") {
    const m = body.error.trim();
    if (m) return [m];
  }
  if (typeof body.message === "string") {
    const m = body.message.trim();
    if (m) return [m];
  }
  return [];
}

export function getApiErrorFromUnknown(
  error: unknown,
  options: GetApiErrorOptionsMultiple
): string[];
export function getApiErrorFromUnknown(
  error: unknown,
  options?: GetApiErrorOptionsSingle
): string;
export function getApiErrorFromUnknown(
  error: unknown,
  options?: GetApiErrorOptions
): string | string[] {
  const fallback =
    options && "fallback" in options && options.fallback !== undefined
      ? options.fallback
      : "Something went wrong";

  const body = getApiErrorBody(error);
  let messages = collectApiErrorMessages(body);

  if (messages.length === 0 && typeof error === "object" && error !== null) {
    const msg = (error as { message?: string }).message;
    if (typeof msg === "string" && msg.trim()) {
      messages = [msg.trim()];
    }
  }

  if (messages.length === 0) {
    return options?.mode === "multiple" ? [fallback] : fallback;
  }

  if (options?.mode === "multiple") {
    return messages;
  }

  const joinSeparator =
    options && "joinSeparator" in options && options.joinSeparator !== undefined
      ? options.joinSeparator
      : "; ";

  return messages.length === 1 ? messages[0] : messages.join(joinSeparator);
}
