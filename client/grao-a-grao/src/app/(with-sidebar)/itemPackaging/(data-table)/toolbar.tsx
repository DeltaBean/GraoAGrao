"use client"

import { Table } from "@tanstack/react-table"
import { Flex, Select, TextField } from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid"
import { ItemPackagingModel } from "@/types/item_packaging"
import { CategoryModel } from "@/types/category"
import { UnitOfMeasureModel } from "@/types/unit_of_measure"
import { CategoryFilter } from "./category-filter"
import { UnitOfMeasureFilter } from "./unit-of-measure-filter"

interface ItemPackagingToolbarProps {
  table: Table<ItemPackagingModel>
  categories: CategoryModel[]
  units: UnitOfMeasureModel[]
  selectedField: string
  onSelectedFieldChange: (field: string) => void
  filterValue: string
  onFilterValueChange: (val: string) => void
}

export function ItemPackagingToolbar({
  table,
  categories,
  units,
  selectedField,
  onSelectedFieldChange,
  filterValue,
  onFilterValueChange
}: ItemPackagingToolbarProps) {
  const column = table.getColumn(selectedField)

  return (
    <Flex gap="2" align="center" wrap="wrap" className="w-full">
      <Select.Root
        value={selectedField}
        onValueChange={(value) => {
          table.getColumn(selectedField)?.setFilterValue(undefined)
          onSelectedFieldChange(value)
        }}
      >
        <Select.Trigger className="min-w-[140px]" />
        <Select.Content>
          <Select.Item value="description">Descrição</Select.Item>
          <Select.Item value="item-description">Item</Select.Item>
        </Select.Content>
      </Select.Root>

      <TextField.Root
        placeholder={`Buscar por ${selectedField === "description" ? "Descrição" : ""}`}
        className="max-w-sm"
        value={filterValue}
        onChange={(e) => {
          onFilterValueChange(e.target.value);
          column?.setFilterValue(e.target.value);
        }}
      >
        <TextField.Slot>
          <MagnifyingGlassIcon height="16" width="16" />
        </TextField.Slot>
      </TextField.Root>
      <CategoryFilter table={table} options={categories} />
      <UnitOfMeasureFilter table={table} options={units} />
    </Flex>
  )
}
