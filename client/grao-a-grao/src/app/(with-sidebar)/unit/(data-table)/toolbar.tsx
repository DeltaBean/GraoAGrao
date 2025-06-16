"use client"

import { Table } from "@tanstack/react-table"
import { Flex, Select, TextField } from "@radix-ui/themes"
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid"
import { UnitOfMeasureModel } from "@/types/unit_of_measure"

interface UnitOfMeasureToolbarProps {
  table: Table<UnitOfMeasureModel>
  selectedField: string
  onSelectedFieldChange: (field: string) => void
  filterValue: string
  onFilterValueChange: (val: string) => void
}

export function UnitOfMeasureToolbar({
  table,
  selectedField,
  onSelectedFieldChange,
  filterValue,
  onFilterValueChange
}: UnitOfMeasureToolbarProps) {
  const column = table.getColumn(selectedField);

  return (
    <Flex gap="2" align="center" wrap="wrap" className="w-full">
      <Select.Root
        value={selectedField}
        onValueChange={(value) => {
          table.getColumn(selectedField)?.setFilterValue(undefined);
          onSelectedFieldChange(value);
        }}
      >
        <Select.Trigger className="min-w-[140px]" />
        <Select.Content>
          <Select.Item value="description">Descrição</Select.Item>
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
    </Flex>
  );
}