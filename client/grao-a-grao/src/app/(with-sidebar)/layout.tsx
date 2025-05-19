import "@radix-ui/themes/styles.css";
import "@/styles/globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
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
