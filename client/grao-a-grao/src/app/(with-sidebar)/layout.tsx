"use client"

import { AppSidebar } from "@/components/AppSidebar";
import MainProviders from "@/providers/MainProviders";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MainProviders>
      <AppSidebar />
      {children}
    </MainProviders>
  );
}
