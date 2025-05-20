"use client";

import { Suspense } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { StoreProvider } from "@/context/StoreContext";

export default function RootProviders({ children }: { children: React.ReactNode }) {
    return (
        <Suspense fallback={null}>
            <StoreProvider>
                <SidebarProvider>
                    {children}
                </SidebarProvider>
            </StoreProvider>
        </Suspense>
    );
}