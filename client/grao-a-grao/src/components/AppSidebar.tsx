import { Calendar, Home, Inbox, Search, Settings, Store } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
    icon: Inbox,
  },
  {
    title: "Categoria",
    url: "category",
    icon: Calendar,
  },
  {
    title: "Unidade de Medida",
    url: "unit",
    icon: Search,
  },
  {
    title: "Fracionamento",
    url: "itemPackaging",
    icon: Settings,
  },
  {
    title: "Entrada",
    url: "stockin",
    icon: Home,
  },
  {
    title: "Saída",
    url: "stockout",
    icon: Inbox,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
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
    </Sidebar>
  )
}
