"use client";

import { ReactNode } from "react";
import PageTransition from "./pageTransition";

interface PageContentWrapperProps {
  children: ReactNode;
}

export default function PageContentWrapper({
  children,
}: PageContentWrapperProps) {
  return <PageTransition duration={1}>{children}</PageTransition>;
}























