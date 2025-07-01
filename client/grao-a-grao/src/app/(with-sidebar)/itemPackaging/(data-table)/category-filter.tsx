"use client"

import { useState } from "react"
import {
    Popover,
    Button,
    Flex,
    Text,
    Checkbox,
} from "@radix-ui/themes"
import { Table } from "@tanstack/react-table"
import { CategoryModel } from "@/types/category"
import { ChevronDown } from "lucide-react"
import { ItemPackagingModel } from "@/types/item_packaging"
import { motion } from "framer-motion"

interface CategoryFilterProps {
    table: Table<ItemPackagingModel>
    options: CategoryModel[]
}

export function CategoryFilter({ table, options }: CategoryFilterProps) {
    const [isPopOverOpen, setIsPopOverOpen] = useState(false);

    const column = table.getColumn("item-category")
    const selected = (column?.getFilterValue() as string[]) ?? []

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
                                className={`ml-auto transition-transform duration-500 ${isPopOverOpen ? "rotate-180" : ""}`}
                            />
                        </Button>
                    </Flex>
                </Popover.Trigger>
                <Popover.Content>
                     <motion.div
  className="overflow-hidden"
  initial={{ opacity: 0, y: -20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -10 }}
  transition={{ duration: 0.4 }}
>

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
                        </motion.div>
                </Popover.Content>
            </Popover.Root>
        </Flex>
    )
}
