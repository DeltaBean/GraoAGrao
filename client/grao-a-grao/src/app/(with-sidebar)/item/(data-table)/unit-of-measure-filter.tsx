"use client"

import { useState } from "react"
import {
  Popover,
  Button,
  Flex,
  Text,
  Checkbox
} from "@radix-ui/themes"
import { Table } from "@tanstack/react-table"
import { ItemModel } from "@/types/item"
import { UnitOfMeasureModel } from "@/types/unit_of_measure"
import { ChevronDown } from "lucide-react"

interface UnitFilterProps {
  table: Table<ItemModel>
  options: UnitOfMeasureModel[]
}

export function UnitOfMeasureFilter({ table, options }: UnitFilterProps) {
  const [isPopOverOpen, setIsPopOverOpen] = useState(false);
  
  const column = table.getColumn("item-unit-of-measure")
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
          <Flex align="center">
            <Button variant="soft" size="2">
              Unidades {selected.length > 0 ? `(${selected.length})` : ""} 
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
            <Text size="2" weight="bold">Filtrar por Unidade</Text>
            {options.map((unit) => (
              <Flex key={unit.id} gap="2" align="center">
                <Checkbox
                  checked={selected.includes(unit.description)}
                  onCheckedChange={() => toggle(unit.description)}
                  id={unit.description}
                />
                <label htmlFor={unit.description}>{unit.description}</label>
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
