"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type QuizLeaveType = "back" | "navigate";

export interface QuizPendingLeave {
  type: QuizLeaveType;
  url?: string;
}

interface UseQuizLeaveGuardOptions {
  enabled: boolean;
  quizPath?: string;
  landingPath?: string;
}

function resolveLeaveTarget(url: string, landingPath: string): string {
  try {
    const parsed = new URL(url, window.location.origin);

    if (parsed.origin !== window.location.origin) {
      return parsed.href;
    }

    const internal = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    return internal || landingPath;
  } catch {
    return landingPath;
  }
}

function isSameQuizPath(pathname: string, quizPath: string): boolean {
  return pathname === quizPath || pathname === window.location.pathname;
}

function shouldInterceptNavigation(
  href: string,
  quizPath: string
): string | null {
  if (!href || href.startsWith("#") || href.startsWith("mailto:")) {
    return null;
  }

  try {
    const nextPath = new URL(href, window.location.origin).pathname;

    if (isSameQuizPath(nextPath, quizPath)) {
      return null;
    }

    return href;
  } catch {
    return null;
  }
}

export function useQuizLeaveGuard({
  enabled,
  quizPath = "/quiz/questions",
  landingPath = "/",
}: UseQuizLeaveGuardOptions) {
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const pendingLeaveRef = useRef<QuizPendingLeave | null>(null);
  const allowLeaveRef = useRef(false);
  const isLeaveModalOpenRef = useRef(false);
  const enabledRef = useRef(enabled);
  const landingPathRef = useRef(landingPath);
  const quizPathRef = useRef(quizPath);

  useEffect(() => {
    isLeaveModalOpenRef.current = isLeaveModalOpen;
  }, [isLeaveModalOpen]);

  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  useEffect(() => {
    landingPathRef.current = landingPath;
  }, [landingPath]);

  useEffect(() => {
    quizPathRef.current = quizPath;
  }, [quizPath]);

  const navigateTo = useCallback((url: string) => {
    const target = resolveLeaveTarget(url, landingPathRef.current);
    allowLeaveRef.current = true;
    window.location.assign(target);
  }, []);

  const openLeaveModal = useCallback((pending: QuizPendingLeave) => {
    pendingLeaveRef.current = pending;
    setIsLeaveModalOpen(true);
  }, []);

  const requestLeave = useCallback(
    (url: string) => {
      if (!enabledRef.current || allowLeaveRef.current) {
        navigateTo(url);
        return;
      }

      openLeaveModal({ type: "navigate", url });
    },
    [navigateTo, openLeaveModal]
  );

  const closeLeaveModal = useCallback(() => {
    pendingLeaveRef.current = null;
    setIsLeaveModalOpen(false);
  }, []);

  const allowNavigation = useCallback(() => {
    allowLeaveRef.current = true;
  }, []);

  const proceedLeave = useCallback(
    (options?: { forceLanding?: boolean }) => {
      const pending = pendingLeaveRef.current;
      allowLeaveRef.current = true;
      setIsLeaveModalOpen(false);
      pendingLeaveRef.current = null;

      if (options?.forceLanding) {
        navigateTo(landingPathRef.current);
        return;
      }

      if (!pending) {
        navigateTo(landingPathRef.current);
        return;
      }

      if (pending.type === "back") {
        navigateTo(landingPathRef.current);
        return;
      }

      if (pending.url) {
        navigateTo(pending.url);
      } else {
        navigateTo(landingPathRef.current);
      }
    },
    [navigateTo]
  );

  useEffect(() => {
    if (!enabled) return;

    if (allowLeaveRef.current) return;

    window.history.pushState({ quizLeaveGuard: true }, "", window.location.href);

    const handlePopState = () => {
      if (allowLeaveRef.current) return;

      openLeaveModal({ type: "back" });
      window.history.pushState({ quizLeaveGuard: true }, "", window.location.href);
    };

    const handleDocumentClick = (event: MouseEvent) => {
      if (allowLeaveRef.current || isLeaveModalOpenRef.current) return;

      const target = event.target;
      if (!(target instanceof Element)) return;

      const anchor = target.closest("a[href]");
      if (!anchor) return;
      if (anchor.getAttribute("target") === "_blank") return;

      const href = anchor.getAttribute("href");
      const interceptedHref = shouldInterceptNavigation(
        href ?? "",
        quizPathRef.current
      );

      if (!interceptedHref) return;

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      openLeaveModal({ type: "navigate", url: interceptedHref });
    };

    const originalPushState = window.history.pushState.bind(window.history);

    const interceptHistoryPush = (
      state: unknown,
      unused: string,
      url?: string | URL | null
    ) => {
      if (allowLeaveRef.current || !enabledRef.current || isLeaveModalOpenRef.current) {
        return false;
      }

      if (!url) return false;

      const urlString = typeof url === "string" ? url : url.toString();
      const interceptedHref = shouldInterceptNavigation(
        urlString,
        quizPathRef.current
      );

      if (!interceptedHref) return false;

      openLeaveModal({ type: "navigate", url: interceptedHref });
      return true;
    };

    window.history.pushState = ((state, unused, url) => {
      if (interceptHistoryPush(state, unused, url)) return;
      originalPushState(state, unused, url);
    }) as typeof window.history.pushState;

    window.addEventListener("popstate", handlePopState);
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      document.removeEventListener("click", handleDocumentClick, true);
      window.history.pushState = originalPushState;
    };
  }, [enabled, openLeaveModal]);

  return {
    isLeaveModalOpen,
    closeLeaveModal,
    proceedLeave,
    allowNavigation,
    requestLeave,
  };
}
