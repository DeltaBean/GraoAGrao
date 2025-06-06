"use client"

import { ArrowDownFromLine, ArrowUpFromLine, Blocks, Box, Home, LogOut, Ruler, Store, Tag } from "lucide-react"

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
} from "@/components/ui/sidebar"
import { StoreSwitcher } from "./StoreSwitcher"
import { StoreModel } from "@/types/store"
import { createEmptyStore } from "@/util/factory/store"

import { logout } from "@/util/util"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useStoreContext } from "@/context/StoreContext"

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
]

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams}` : '');

  const { stores, selectedStore, setSelectedStore } = useStoreContext();

  const handleStoreChange = (store: StoreModel) => {
    setSelectedStore(store);
    toast.success(`Loja alterada para ${store.name}`);
    router.replace(currentUrl);
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
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
                  <SidebarMenuButton asChild onClick={() => router.push(item.url)}>
                    <a>
                      <item.icon />
                      <span className="cursor-default">{item.title}</span>
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
                <SidebarMenuButton asChild onClick={() => {
                  logout();
                  router.push("/login");
                }}>
                  <div>
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
  )
}
