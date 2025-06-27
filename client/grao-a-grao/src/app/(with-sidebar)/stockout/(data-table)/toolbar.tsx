"use client"

import { Table } from "@tanstack/react-table"
import { Flex  } from "@radix-ui/themes"
import { StatusFilter } from "./status-filter"
import { DateFilter } from "./created-at-filter"
import { StockOutModel } from "@/types/stock_out"

interface StockOutToolbarProps {
  table: Table<StockOutModel>
}

export function StockOutToolbar({
  table,
}: StockOutToolbarProps) {

  return (
    <Flex gap="2" align="center" wrap="wrap" className="w-full">
      <DateFilter table={table}/>
      <StatusFilter table={table}/>
    </Flex>
  );
}