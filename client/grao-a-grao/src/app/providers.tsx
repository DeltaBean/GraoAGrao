"use client";

import { Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import GlobalFetchInterceptor from "@/components/GlobalFetcherInterceptor";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StoreProvider } from "@/context/StoreContext";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        <SidebarProvider>
          <GlobalFetchInterceptor>{children}</GlobalFetchInterceptor>
        </SidebarProvider>
        <Toaster duration={3000} closeButton />
      </StoreProvider>
    </Suspense>
  );
}
