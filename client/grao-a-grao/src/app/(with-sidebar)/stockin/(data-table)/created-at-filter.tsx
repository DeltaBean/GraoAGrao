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
    const from = new Date(now)
    from.setHours(0, 0, 0, 0)

    const to = new Date(now)
    to.setHours(23, 59, 59, 999)

    column?.setFilterValue({
      from: from.toISOString(),
      to: to.toISOString(),
    })
  }, [column])

  return (

    <DateRangePicker
      onUpdate={(values) => {
        const from = new Date(values.range.from)
        from.setHours(0, 0, 0, 0)

        const to = new Date(values.range.to ?? values.range.from)
        to.setHours(23, 59, 59, 999)

        column?.setFilterValue({
          from: from.toISOString(),
          to: to.toISOString(),
        })
      }}
      initialDateFrom={now}
      initialDateTo={now}
      align="start"
      locale={typeof navigator !== 'undefined' ? navigator.language : 'en-US'}
      showCompare={false}
    />


  )
}
