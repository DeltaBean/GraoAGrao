"use client";

import {
  ArrowDownFromLine,
  ArrowUpFromLine,
  Blocks,
  Box,
  Home,
  LogOut,
  Ruler,
  Store,
  Tag,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { StoreSwitcher } from "./StoreSwitcher";
import { StoreModel } from "@/types/store";
import { createEmptyStore } from "@/util/factory/store";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useStoreContext } from "@/context/StoreContext";
import { useState } from "react";
import { ModalFormLogout } from "@/components/Form/Modal/ModalLogoutConfirmation";

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Loja",
    url: "/store",
    icon: Store,
  },
  {
    title: "Item",
    url: "/item",
    icon: Box,
  },
  {
    title: "Categoria",
    url: "/category",
    icon: Tag,
  },
  {
    title: "Unidade de Medida",
    url: "/unit",
    icon: Ruler,
  },
  {
    title: "Fracionamento",
    url: "/itemPackaging",
    icon: Blocks,
  },
  {
    title: "Entrada de Estoque",
    url: "/stockin",
    icon: ArrowUpFromLine,
  },
  {
    title: "Saída de Estoque",
    url: "/stockout",
    icon: ArrowDownFromLine,
  },
];

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl =
    pathname + (searchParams.toString() ? `?${searchParams}` : "");

  const { stores, selectedStore, setSelectedStore } = useStoreContext();
  const { setOpenMobile } = useSidebar();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleStoreChange = (store: StoreModel) => {
    setSelectedStore(store);
    toast.success(`Loja alterada para ${store.name}`);
    router.replace(currentUrl);
  };

  return (
    <>
      <Sidebar collapsible="icon">
        <SidebarHeader className="cursor-pointer">
          <StoreSwitcher
            stores={stores}
            defaultStore={selectedStore ?? createEmptyStore()}
            onStoreChange={handleStoreChange}
          />
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-3">
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className="cursor-pointer"
                      asChild
                      onClick={() => router.push(item.url)}
                    >
                      <a>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton className="cursor-pointer" asChild>
                    <div
                      onClick={() => {
                        setOpenMobile(false);
                        setTimeout(() => setShowLogoutModal(true), 150);
                      }}
                    >
                      <LogOut />
                      <span>Sair</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
      <ModalFormLogout
        modalOpen={showLogoutModal}
        setModalOpen={setShowLogoutModal}
      />
    </>
  );
}
