"use client"

import { ColumnDef } from "@tanstack/react-table"
import { StoreModel } from "@/types/store";
import { formatDateTime } from "@/util/util";
import { MoreHorizontal } from "lucide-react"

import { Button, DropdownMenu, Flex, IconButton } from "@radix-ui/themes";

/*
    Columns are where you define the core of what your table will look like. 
    They define the data that will be displayed, how it will be formatted, sorted and filtered.
*/

export const columns: ColumnDef<StoreModel>[] = [
    {
        accessorKey: "name",
        header: "Nome",
    },
    {
        accessorKey: "created_at",
        header: "Criada Em",
        cell: ({ row }) => {
            return formatDateTime(row.getValue("created_at"));
        },
    },
    {
        id: "actions",
        header: () => <div className="text-center">Ações</div>,
        cell: ({ row }) => {
            const store = row.original

            return (
                <Flex justify={"center"}>
                    <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                            <IconButton variant="ghost" size="1">
                                <MoreHorizontal className="h-5 w-5" />
                            </IconButton>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content>
                            <DropdownMenu.Item>Editar</DropdownMenu.Item>
                            <DropdownMenu.Item>Excluir</DropdownMenu.Item>
                        </DropdownMenu.Content>
                    </DropdownMenu.Root>
                </Flex>
            )
        },
    }
]