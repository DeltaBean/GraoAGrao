"use client"

import { useEffect } from "react"
import { Table } from "@tanstack/react-table"
import { StockInModel } from "@/types/stock_in"
import { DateRangePicker } from "@/components/ui/date-range-picker"

interface DateFilterProps {
  table: Table<StockInModel>
}

export function DateFilter({ table }: DateFilterProps) {

  const column = table.getColumn("created_at") // or "date" if that’s the name
  const now = new Date()

  useEffect(() => {
    column?.setFilterValue({
      from: now.toISOString(),
      to: now.toISOString(),
    })
  }, [column])
  
  return (

    <DateRangePicker
      onUpdate={(values) => {
        const from = values.range.from.toISOString()
        const to = values.range.to?.toISOString()

        column?.setFilterValue({ from, to }) // Apply the filter to the column
      }}
      initialDateFrom={now}
      initialDateTo={now}
      align="start"
      locale={typeof navigator !== 'undefined' ? navigator.language : 'en-US'}
      showCompare={false}
    />


  )
}
