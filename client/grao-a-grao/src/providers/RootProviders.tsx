"use client";

import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import GlobalFetchInterceptor from "@/components/GlobalFetcherInterceptor";
export default function RootProviders({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <GlobalFetchInterceptor>{children}</GlobalFetchInterceptor>
      <Toaster duration={3000} closeButton />
    </Suspense>
  );
}