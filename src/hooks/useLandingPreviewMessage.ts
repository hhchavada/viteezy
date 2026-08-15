"use client";

import { useEffect, useState } from "react";

type PreviewMessage<T> = {
  type: "LANDING_PREVIEW";
  payload: T;
};

export function useLandingPreviewMessage<T>(allowedOrigin: string) {
  const [payload, setPayload] = useState<T | null>(null);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== allowedOrigin) return;
      const data = event.data as PreviewMessage<T>;
      if (!data || data.type !== "LANDING_PREVIEW") return;

      setPayload(data.payload);
    };

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [allowedOrigin]);

  return payload;
}
