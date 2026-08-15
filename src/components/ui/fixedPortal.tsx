"use client";

import { createElement, Fragment, useEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

export default function FixedPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return createElement(Fragment, null, children);
  }

  return createPortal(children, document.body);
}
