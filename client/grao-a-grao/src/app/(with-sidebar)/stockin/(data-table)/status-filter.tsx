"use client"

import { useState } from "react"
import {
    Popover,
    Button,
    Flex,
    Text,
    Checkbox,
    RadioGroup,
} from "@radix-ui/themes"
import { Table } from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"
import { StockInModel } from "@/types/stock_in"

interface StatusFilterProps {
    table: Table<StockInModel>
}

export function StatusFilter({ table }: StatusFilterProps) {
    const [isPopOverOpen, setIsPopOverOpen] = useState(false)

    const column = table.getColumn("status")
    const selected = (column?.getFilterValue() as string) ?? ""

    const clearAll = () => column?.setFilterValue(undefined)

    const handleChange = (value: string) => {
        column?.setFilterValue(value)
    }

    return (
        <Flex direction="row" gap="2">
            <Popover.Root onOpenChange={setIsPopOverOpen} open={isPopOverOpen}>
                <Popover.Trigger>
                    <Flex align="center">
                        <Button variant="soft" size="2">
                            Status
                            <ChevronDown
                                width={16}
                                height={16}
                                className={`ml-auto transition-transform duration-200 ${isPopOverOpen ? "rotate-180" : ""}`}
                            />
                        </Button>
                    </Flex>
                </Popover.Trigger>
                <Popover.Content>
                    <Flex direction="column" gap="4" p="2">
                        <Text size="2" weight="bold">Filtrar por Status</Text>
                        <RadioGroup.Root value={selected} onValueChange={handleChange} name="status">
                            <Flex direction={"column"} gap="2">
                                <RadioGroup.Item value="draft">Rascunho</RadioGroup.Item>
                                <RadioGroup.Item value="finalized">Finalizada</RadioGroup.Item>
                            </Flex>
                        </RadioGroup.Root>
                        <Button variant="ghost" size="1" onClick={clearAll}>
                            Limpar
                        </Button>
                    </Flex>
                </Popover.Content>
            </Popover.Root>
        </Flex>
    )
}
