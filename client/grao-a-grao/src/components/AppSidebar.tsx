"use client"

import { ArrowDownFromLine, ArrowUpFromLine, Blocks, Box, Calendar, DoorOpen, Home, Inbox, LogIn, LogOut, Ruler, Search, Settings, Store, Tag, TagIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { StoreSwitcher } from "./StoreSwitcher"
import { SearchForm } from "./SearchForm"
import { use, useEffect, useState } from "react"
import { normalizeStoreResponse, StoreModel } from "@/types/store"
import { createEmptyStore } from "@/util/factory/store"
import * as storesApi from "@/api/stores_api";
import { getSelectedStore, logout } from "@/util/util"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"

// Menu items.
const items = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Loja",
    url: "store",
    icon: Store,
  },
  {
    title: "Item",
    url: "item",
    icon: Box,
  },
  {
    title: "Categoria",
    url: "category",
    icon: Tag,
  },
  {
    title: "Unidade de Medida",
    url: "unit",
    icon: Ruler,
  },
  {
    title: "Fracionamento",
    url: "itemPackaging",
    icon: Blocks,
  },
  {
    title: "Entrada de Estoque",
    url: "stockin",
    icon: ArrowUpFromLine,
  },
  {
    title: "Saída de Estoque",
    url: "stockout",
    icon: ArrowDownFromLine,
  },
]

export function AppSidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentUrl = pathname + (searchParams.toString() ? `?${searchParams}` : '');

  const [stores, setStores] = useState<StoreModel[]>([]);

  const fetchStores = async () => {
    try {
      const storeResponse: StoreModel[] = await storesApi.fetchStores();
      const storeModel: StoreModel[] = storeResponse.map((store) => normalizeStoreResponse(store));

      setStores(storeModel ?? []);
    } catch (error) {
      console.error("Error fetching stores:", error);
    }
  }

  useEffect(() => {
    fetchStores();
  }, []);

  const handleStoreChange = async (store: StoreModel) => {
    try {
      sessionStorage.setItem("selectedStore", JSON.stringify(store));
      toast.success(`Loja alterada para ${store.name}`);

      router.replace(currentUrl);
    } catch (error) {
      console.error("Error changing store:", error);
      toast.error("Erro ao alterar loja");
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <StoreSwitcher
          stores={stores}
          defaultStore={getSelectedStore() || stores[0] || createEmptyStore()}
          onStoreChange={(store) => {
            const previous = getSelectedStore();
            if (previous && previous.id === store.id) {
              return;
            }
            handleStoreChange(store);
          }}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
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
