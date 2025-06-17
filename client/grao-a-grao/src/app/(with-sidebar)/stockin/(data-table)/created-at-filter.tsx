"use client"

import { useState } from "react"
import {
  Popover,
  Button,
  Flex,
  Text,
  TextField,
} from "@radix-ui/themes"
import { Table } from "@tanstack/react-table"
import { ChevronDown } from "lucide-react"
import { StockInModel } from "@/types/stock_in"

interface DateFilterProps {
  table: Table<StockInModel>
}

export function DateFilter({ table }: DateFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  const column = table.getColumn("created_at") // or "date" if that’s the name
  const value = (column?.getFilterValue() as { from: string; to: string }) ?? {
    from: "",
    to: "",
  }

  const handleChange = (field: "from" | "to", val: string) => {
    column?.setFilterValue({
      ...value,
      [field]: val,
    })
  }

  const clearAll = () => {
    column?.setFilterValue(undefined)
  }

  return (
    <Popover.Root onOpenChange={setIsOpen} open={isOpen}>
      <Popover.Trigger>
        <Button variant="soft" size="2">
          Criada Em
          <ChevronDown
            width={16}
            height={16}
            className={`ml-2 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <Flex direction="column" gap="3" p="2" width="auto">
          <Text size="2" weight="bold">Filtrar por Data</Text>
          <Flex direction="column" gap="2">
            <label>
              <Text size="1">De:</Text>
              <TextField.Root
                type="datetime-local"
                value={value.from}
                onChange={(e) => handleChange("from", e.target.value)}
              />
            </label>
            <label>
              <Text size="1">Até:</Text>
              <TextField.Root
                type="datetime-local"
                value={value.to}
                onChange={(e) => handleChange("to", e.target.value)}
              />
            </label>
          </Flex>
          <Button variant="ghost" size="1" onClick={clearAll}>
            Limpar
          </Button>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  )
}
