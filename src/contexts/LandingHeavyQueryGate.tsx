"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";

export type LandingHeavyQueryGateValue = {
  /** When false, defer non-critical RTK queries on the landing route until idle or prefetch. */
  allowHeavyQueries: boolean;
  /** Call on user intent (e.g. cart hover) to start heavy queries immediately. */
  prefetchHeavyQueries: () => void;
};

const LandingHeavyQueryGateContext =
  createContext<LandingHeavyQueryGateValue | null>(null);

function isLandingPath(pathname: string | null) {
  return pathname === "/" || pathname === "/preview-landing";
}

export function LandingHeavyQueryGateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLanding = isLandingPath(pathname);

  const [forced, setForced] = useState(false);
  const [idleReached, setIdleReached] = useState(!isLanding);

  useEffect(() => {
    if (!isLanding) {
      setIdleReached(true);
      setForced(false);
      return;
    }

    setIdleReached(false);
    setForced(false);

    let cancelled = false;
    const done = () => {
      if (!cancelled) setIdleReached(true);
    };

    let cancelScheduled: () => void;
    if (typeof requestIdleCallback === "function") {
      const idleId = requestIdleCallback(done, { timeout: 2000 });
      cancelScheduled = () => cancelIdleCallback(idleId);
    } else {
      const t = setTimeout(done, 1200);
      cancelScheduled = () => clearTimeout(t);
    }
    return () => {
      cancelled = true;
      cancelScheduled();
    };
  }, [isLanding]);

  const prefetchHeavyQueries = useCallback(() => {
    setForced(true);
  }, []);

  const value = useMemo<LandingHeavyQueryGateValue>(
    () => ({
      allowHeavyQueries: !isLanding || forced || idleReached,
      prefetchHeavyQueries,
    }),
    [isLanding, forced, idleReached, prefetchHeavyQueries]
  );

  return (
    <LandingHeavyQueryGateContext.Provider value={value}>
      {children}
    </LandingHeavyQueryGateContext.Provider>
  );
}

export function useLandingHeavyQueryGate(): LandingHeavyQueryGateValue {
  const ctx = useContext(LandingHeavyQueryGateContext);
  return (
    ctx ?? {
      allowHeavyQueries: true,
      prefetchHeavyQueries: () => {},
    }
  );
}
