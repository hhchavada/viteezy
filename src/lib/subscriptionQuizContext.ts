const SUBSCRIPTION_QUIZ_CHANGE_KEY = "viteezy_subscription_quiz_change";

export type SubscriptionQuizChangeContext = {
  mode: "subscription_change";
  subscriptionId: string;
  /** Subscription plan length in days (e.g. 30, 90, 180). */
  cycleDays?: number;
};

function normalizeCycleDays(value: unknown): number | undefined {
  const parsed =
    typeof value === "number" ? value : Number(String(value ?? "").trim());
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return Math.round(parsed);
}

export function saveSubscriptionQuizChangeContext(
  subscriptionId: string,
  cycleDays?: number
) {
  if (typeof window === "undefined") return;
  const id = subscriptionId?.trim();
  if (!id) return;

  const existing = getSubscriptionQuizChangeContext();
  const resolvedCycleDays =
    normalizeCycleDays(cycleDays) ??
    (existing?.subscriptionId === id ? existing.cycleDays : undefined);

  const payload: SubscriptionQuizChangeContext = {
    mode: "subscription_change",
    subscriptionId: id,
    ...(resolvedCycleDays != null ? { cycleDays: resolvedCycleDays } : {}),
  };
  sessionStorage.setItem(SUBSCRIPTION_QUIZ_CHANGE_KEY, JSON.stringify(payload));
}

export function getSubscriptionQuizChangeContext(): SubscriptionQuizChangeContext | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(SUBSCRIPTION_QUIZ_CHANGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<SubscriptionQuizChangeContext>;
    const subscriptionId = parsed.subscriptionId?.trim();
    if (parsed.mode !== "subscription_change" || !subscriptionId) {
      return null;
    }

    const cycleDays = normalizeCycleDays(parsed.cycleDays);

    return {
      mode: "subscription_change",
      subscriptionId,
      ...(cycleDays != null ? { cycleDays } : {}),
    };
  } catch {
    return null;
  }
}

export function clearSubscriptionQuizChangeContext() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(SUBSCRIPTION_QUIZ_CHANGE_KEY);
}

export function isSubscriptionChangeQuiz(): boolean {
  return getSubscriptionQuizChangeContext()?.mode === "subscription_change";
}

/** Days from subscription-change session context, when available. */
export function getSubscriptionChangeCycleDays(): number | undefined {
  return getSubscriptionQuizChangeContext()?.cycleDays;
}

/** Build /quiz URL that carries subscription-change entry context. */
export function buildSubscriptionChangeQuizPath(
  subscriptionId: string,
  cycleDays?: number
): string {
  const id = subscriptionId.trim();
  const params = new URLSearchParams({
    from: "subscription_change",
    subscriptionId: id,
  });

  const resolvedCycleDays = normalizeCycleDays(cycleDays);
  if (resolvedCycleDays != null) {
    params.set("cycleDays", String(resolvedCycleDays));
  }

  return `/quiz?${params.toString()}`;
}

export function syncSubscriptionQuizContextFromSearchParams(
  searchParams: URLSearchParams | { get: (key: string) => string | null }
) {
  const from = searchParams.get("from");
  const subscriptionId = searchParams.get("subscriptionId")?.trim();
  const cycleDays = normalizeCycleDays(searchParams.get("cycleDays"));

  if (from === "subscription_change" && subscriptionId) {
    saveSubscriptionQuizChangeContext(subscriptionId, cycleDays);
    return true;
  }

  return false;
}
