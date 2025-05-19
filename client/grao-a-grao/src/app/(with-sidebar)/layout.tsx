import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";
import { Toaster } from "@/components/ui/sonner"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { StoreProvider } from "@/context/StoreContext";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <SidebarProvider>
        <AppSidebar />
        {children}
      </SidebarProvider>
    </StoreProvider>
  );
}
