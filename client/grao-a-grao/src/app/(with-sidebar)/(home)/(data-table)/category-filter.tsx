"use client"

import {
    Popover,
    Button,
    Flex,
    Text,
    Checkbox,
} from "@radix-ui/themes"
import { Table } from "@tanstack/react-table"
import { CategoryModel } from "@/types/category"
import { StockModel } from "@/types/stock"
import { ChevronDown } from "lucide-react"
import { useState } from "react"

interface CategoryFilterProps {
    table: Table<StockModel>
    options: CategoryModel[]
}

export function CategoryFilter({ table, options }: CategoryFilterProps) {
    const column = table.getColumn("item-category")
    const selected = (column?.getFilterValue() as string[]) ?? []
    const [isPopOverOpen, setIsPopOverOpen] = useState(false);
    
    const toggle = (id: string) => {
        const updated = selected.includes(id)
            ? selected.filter((v) => v !== id)
            : [...selected, id]
        column?.setFilterValue(updated)
    }

    const clearAll = () => column?.setFilterValue([])

    return (
        <Flex direction="row" gap="2">
            <Popover.Root onOpenChange={setIsPopOverOpen} open={isPopOverOpen}>
                <Popover.Trigger>
                    <Flex align={"center"}>
                        <Button variant="soft" size="2">
                            Categorias {selected.length > 0 ? `(${selected.length})` : ""}
                            <ChevronDown
                                width={16}
                                height={16}
                                className={`ml-auto transition-transform duration-200 ${isPopOverOpen ? "rotate-180" : ""}`}
                            />
                        </Button>
                    </Flex>
                </Popover.Trigger>
                <Popover.Content>
                    <Flex direction="column" gap="2" p="2">
                        <Text size="2" weight="bold">Filtrar por Categoria</Text>
                        {options.map((cat) => (
                            <Flex key={cat.id} gap="2" align="center">
                                <Checkbox
                                    checked={selected.includes(cat.description)}
                                    onCheckedChange={() => toggle(cat.description)}
                                    id={cat.description}
                                />
                                <label htmlFor={cat.description}>{cat.description}</label>
                            </Flex>
                        ))}
                        <Button variant="ghost" size="1" onClick={clearAll}>
                            Limpar
                        </Button>
                    </Flex>
                </Popover.Content>
            </Popover.Root>
        </Flex>
    )
}
