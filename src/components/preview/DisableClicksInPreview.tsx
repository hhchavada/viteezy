"use client";

import { useEffect } from "react";

const VIDEO_CONTROLS_BUTTON_ID = "video-controls-button";

/**
 * When this page is shown inside the admin iframe, block only click events
 * so that scroll, touch, and other interactions still work.
 * Clicks on #video-controls-button (e.g. video play/pause) are allowed.
 */
export default function DisableClicksInPreview() {
  useEffect(() => {
    const blockClick = (e: MouseEvent) => {
      const target = e.target as Node;
      const isVideoControl = document
        .getElementById(VIDEO_CONTROLS_BUTTON_ID)
        ?.contains(target);
      if (isVideoControl) return;

      e.preventDefault();
      e.stopPropagation();
    };

    document.addEventListener("click", blockClick, true);
    return () => document.removeEventListener("click", blockClick, true);
  }, []);

  return null;
}
