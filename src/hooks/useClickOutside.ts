import { useEffect, useRef } from "react";

/**
 * Custom hook to detect clicks outside of a specified element
 * @param handler - Function to call when a click outside is detected
 * @param excludeSelectors - Optional array of CSS selectors for elements to exclude from click-outside detection (e.g., buttons that trigger the element)
 * @returns A ref to attach to the element you want to detect clicks outside of
 */
export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  excludeSelectors?: string[]
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }

      // Check if click is on an excluded element
      if (excludeSelectors && excludeSelectors.length > 0) {
        const target = event.target as HTMLElement;
        const isExcluded = excludeSelectors.some((selector) => {
          return target.closest(selector) !== null;
        });

        if (isExcluded) {
          return;
        }
      }

      handler();
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [handler, excludeSelectors]);

  return ref;
}

