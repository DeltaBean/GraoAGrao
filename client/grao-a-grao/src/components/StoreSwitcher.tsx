"use client"

import * as React from "react"
import { useState } from "react"
import { Check, ChevronDown, GalleryVerticalEnd } from "lucide-react"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { StoreModel } from "@/types/store"
import { useStoreContext } from "@/context/StoreContext"

export function StoreSwitcher({
    onStoreChange,
}: {
    stores: StoreModel[]
    defaultStore: StoreModel
    onStoreChange: (store: StoreModel) => void
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
                            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-accent">
                                <GalleryVerticalEnd className="size-4" />
                            </div>
                            <div className="flex flex-col gap-0.5 leading-none">
                                <span className="font-semibold">Loja</span>
                                <span>{selectedStore ? selectedStore.name : "Selecione uma loja"}</span>
                            </div>
                            <ChevronDown
                                className={`ml-auto transition-transform duration-500 ${menuOpen ? "rotate-180" : ""}`}
                            />
                        </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        className="w-[var(--radix-dropdown-menu-trigger-width)] bg-[var(--muted)] text-[var(--foreground)]
"
                        align="start"
                    >
                        {stores.map((st) => (
                            <DropdownMenuItem
                                key={st.id}
                                onSelect={() => setSelectedStore(st)}
                                onClick={() => onStoreChange(st)}
                                className="cursor-pointer"
                            >
                                {st.name}
                                {st === selectedStore && <Check className="ml-auto" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            </SidebarMenuItem>
        </SidebarMenu>
    )
}
