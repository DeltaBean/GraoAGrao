"use client"

import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";
import { AppSidebar } from "@/components/AppSidebar";
import { StoreProvider } from "@/context/StoreContext";
import MainProviders from "@/providers/MainProviders";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <StoreProvider>
        <MainProviders>
          <AppSidebar />
          {children}
        </MainProviders>
      </StoreProvider>
  );
}
