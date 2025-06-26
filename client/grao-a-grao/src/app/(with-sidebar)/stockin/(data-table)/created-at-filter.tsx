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
import { DateRangePicker } from "@/components/ui/date-range-picker"

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

        <DateRangePicker
          onUpdate={(values) => console.log(values)}
          initialDateFrom="2023-01-01"
          initialDateTo="2023-12-31"
          align="start"
          locale={typeof navigator !== 'undefined' ? navigator.language : 'en-US'}
          showCompare={false}
        />


  )
}
