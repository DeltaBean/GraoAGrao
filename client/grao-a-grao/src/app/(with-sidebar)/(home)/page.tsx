// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import { Card, Container, Flex, Skeleton } from "@radix-ui/themes";
import Header from "@/components/Header";
import { useEffect, useState } from "react";
import { normalizeStockResponse, StockModel, StockResponse } from "@/types/stock";
import * as stock_api from "@/api/stock_api";

import { getSelectedStore } from "@/util/util";
import { DataTable } from "@/components/ui/data-table";
import { getColumns } from "./(data-table)/columns";

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

    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }
    }
  }
  return (
    <Flex direction={"column"} align={"center"} className="min-h-screen w-full">
      <Header />
      <Flex className="flex-1 my-3 w-full sm:my-8 flex-col">
        <Skeleton loading={false} className="h-2/5">
          <Container>
            <DataTable columns={getColumns()} data={stock} title="Estoque"></DataTable>
          </Container>
        </Skeleton>
      </Flex>
    </Flex>
  );
}
