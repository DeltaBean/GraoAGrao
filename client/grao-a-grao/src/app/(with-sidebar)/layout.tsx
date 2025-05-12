import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "@radix-ui/themes/styles.css";
import { Theme, ThemePanel } from "@radix-ui/themes";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        {children}
        <Toaster richColors />
      </SidebarProvider>
    </>
  );
}
