"use client";

import StockOutForm from "@/components/Form/StockOutForm";
import { createStockOut } from "@/api/stock_out_api";
import {
  ItemPackagingModel,
  ItemPackagingResponse,
  normalizeItemPackagingResponse,
} from "@/types/item_packaging";
import * as item_pack_api from "@/api/item_packaging_api";
import * as item_api from "@/api/items_api";
import { useEffect, useState } from "react";
import { Card, Flex } from "@radix-ui/themes";
import Header from "@/components/Header";
import {
  ItemModel,
  ItemResponse,
  normalizeItemResponse,
} from "@/types/item";
import {
  CreateStockOutRequest,
  StockOutModel,
  toCreateStockOutRequest,
} from "@/types/stock_out";

export default function StockOutCreatePage() {
  const [itemPackagings, setItemPackagings] = useState<ItemPackagingModel[]>([]);
  const [items, setItems] = useState<ItemModel[]>([]);
  const [, setLoading] = useState(false);

  useEffect(() => {
    fetchItemPackagings();
    fetchItems();
  }, []);

  const fetchItemPackagings = async () => {
    setLoading(true);
    try {
      const resp: ItemPackagingResponse[] = await item_pack_api.fetchItemPackaging();
      setItemPackagings(resp.map(sp => normalizeItemPackagingResponse(sp)));
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    setLoading(true);
    try {
      const resp: ItemResponse[] = await item_api.fetchItems();
      setItems(resp.map(it => normalizeItemResponse(it)));
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Flex direction="column" justify="start" align="center" className="min-h-screen w-full">
      <Header/>
      <Card
        id="main-flex"
        className="flex-1 w-8/10 sm:w-9/10 h-full sm:my-12 flex-col"
        style={{ display: "flex" }}
      >
        <StockOutForm
          itemOptions={items}
          itemPackagingOptions={itemPackagings}
          onSubmit={async (data: StockOutModel) => {
            const req: CreateStockOutRequest = toCreateStockOutRequest(data);
            await createStockOut(req);
          }}
        />
      </Card>
    </Flex>
  );
}