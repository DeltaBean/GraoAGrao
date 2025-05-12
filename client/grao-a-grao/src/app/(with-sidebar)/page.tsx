// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Badge, Button, Card, Container, Flex, Section, Text } from "@radix-ui/themes";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { normalizeStockResponse, StockModel, StockResponse } from "@/types/stock";
import * as stock_api from "@/api/stock_api";
import { TableRoot } from "@/components/ui/Table/TableRoot";
import { TableHeader } from "@/components/ui/Table/TableHeader";
import { TableRow } from "@/components/ui/Table/TableRow";
import { TableColumnHeaderCell } from "@/components/ui/Table/TableColumnHeaderCell";
import { TableBody } from "@/components/ui/Table/TableBody";
import { TableCell } from "@/components/ui/Table/TableCell";
import StockTable from "@/components/StockTable";
import { toast } from "sonner";
import { getSelectedStore } from "@/util/util";

export default function HomePage() {
  const storeId = getSelectedStore()?.id
  
  const [stock, setStock] = useState<StockModel[]>([]);

  // Fetch items when the component mounts.
  useEffect(() => {
    fetchStock();
  }, [storeId]);

  const fetchStock = async () => {

    try {
      const stockResponse: StockResponse[] = await stock_api.fetchStocks();
      const stockModel: StockModel[] = stockResponse.map(
        (st) => { return normalizeStockResponse(st) }
      );

      setStock(stockModel ?? []);

    } catch (err: any) {
      console.error(err.message);
    }
  }
  return (
    <Flex direction={"column"} justify={"start"} align={"center"} className="min-h-screen w-full">
      <Header/>
      <Card
        id="main-flex"
        className="flex-1 w-8/10 sm:w-9/10 sm:my-12 flex-col"
        style={{ display: "flex" }}
      >
        <StockTable stock={stock}></StockTable>
      </Card>
    </Flex>
  );
}
