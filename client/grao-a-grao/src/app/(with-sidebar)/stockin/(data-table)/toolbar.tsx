"use client"

import { Table } from "@tanstack/react-table"
import { Flex  } from "@radix-ui/themes"
import { StockInModel } from "@/types/stock_in"
import { StatusFilter } from "./status-filter"
import { DateFilter } from "./created-at-filter"

interface StockInToolbarProps {
  table: Table<StockInModel>
}

export function StockInToolbar({
  table,
}: StockInToolbarProps) {

  return (
    <Flex gap="2" align="center" wrap="wrap" className="w-full">
      <DateFilter table={table}/>
      <StatusFilter table={table}/>
    </Flex>
  );
}