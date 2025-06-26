"use client";

import * as React from "react";
import { useState } from "react";
import { Check, ChevronDown, GalleryVerticalEnd } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { StoreModel } from "@/types/store";
import { useStoreContext } from "@/context/StoreContext";
import { Text, Flex } from "@radix-ui/themes";

export function StoreSwitcher({
  onStoreChange,
}: {
  stores: StoreModel[];
  defaultStore: StoreModel;
  onStoreChange: (store: StoreModel) => void;
}) {
  const { stores, selectedStore, setSelectedStore } = useStoreContext();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground cursor-pointer"
            >
              <Flex justify="center" align="center" direction="row" className="aspect-square size-8 rounded-(--radius-3) bg-sidebar-accent">
                <GalleryVerticalEnd className="size-4" />
              </Flex>
              <Flex direction="column" className="leading-none">
                <Text weight="medium">Loja</Text>
                <Text>
                  {selectedStore ? selectedStore.name : "Selecione uma loja"}
                </Text>
              </Flex>
              <ChevronDown
                className={`ml-auto transition-transform duration-500 ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[var(--radix-dropdown-menu-trigger-width)] bg-[var(--muted)] text-[var(--foreground)]"
            align="start"
          >
            {stores.map((st) => {
              const isSelected = st === selectedStore;
              return (
                <DropdownMenuItem
                  key={st.id}
                  onSelect={() => setSelectedStore(st)}
                  onClick={() => onStoreChange(st)}
                  className={`cursor-pointer ${
                    isSelected ? "bg-sidebar text-[var(--foreground)]" : "hover:bg-sidebar hover:text-foreground "
                  }`}
                >
                  {st.name}
                  {isSelected && <Check className="ml-auto" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
