"use client"

import { Table } from "@tanstack/react-table"
import { Flex, Select, TextField } from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid"
import { CategoryModel } from "@/types/category"
import { CategoryFilter } from "./category-filter"
import { UnitOfMeasureFilter } from "./unit-of-measure-filter"
import { UnitOfMeasureModel } from "@/types/unit_of_measure"
import { StockModel } from "@/types/stock"

interface StockToolbarProps {
  table: Table<StockModel>
  categories: CategoryModel[]
  units: UnitOfMeasureModel[]
  selectedField: string
  onSelectedFieldChange: (field: string) => void
  filterValue: string
  onFilterValueChange: (val: string) => void
}

export function StockToolbar({
  table,
  categories,
  units,
  selectedField,
  onSelectedFieldChange,
  filterValue,
  onFilterValueChange
}: StockToolbarProps) {
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
          <Select.Item value="item-description">Descrição</Select.Item>
        </Select.Content>
      </Select.Root>

      <TextField.Root
        placeholder={`Buscar por ${selectedField === "item-ean" ? "Descrição" : ""}`}
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
