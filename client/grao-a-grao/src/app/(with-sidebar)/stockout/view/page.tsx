"use client";

import StockOutForm from "@/components/Form/StockOutForm";
import { fetchStockOutById } from "@/api/stock_out_api";
import { fetchItemPackaging } from "@/api/item_packaging_api";
import { fetchItems as fetchItemsApi } from "@/api/items_api";
import { useEffect, useState } from "react";
import { ItemPackagingModel, ItemPackagingResponse, normalizeItemPackagingResponse } from "@/types/item_packaging";
import { ItemModel, ItemResponse, normalizeItemResponse } from "@/types/item";
import { normalizeStockOutResponse, StockOutModel, StockOutResponse } from "@/types/stock_out";
import { createEmptyStockOut } from "@/util/factory/stock_out";
import { useSearchParams } from "next/navigation";
import { Card, Flex } from "@radix-ui/themes";
import Header from "@/components/Header";
import LoadingModal from "@/components/LoadingModal";
import { useLoading } from "@/hooks/useLoading";

export default function StockOutViewPage() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [stockOut, setStockOut] = useState<StockOutModel>(createEmptyStockOut());
  const [itemPackagings, setItemPackagings] = useState<ItemPackagingModel[]>([]);
  const [items, setItems] = useState<ItemModel[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { loadingData, setIsLoading, setMessage: setLoadingMessage } = useLoading();

  useEffect(() => {
    if (idParam) fetchData();
  }, [idParam]);

  useEffect(() => {
    loadItemPackagings();
    loadItems();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando Saída de Estoque...");
    try {
      const resp: StockOutResponse = await fetchStockOutById(parseInt(idParam ?? ""));
      setStockOut(normalizeStockOutResponse(resp));
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadItemPackagings = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando Fracionamentos...");
    try {
      const res: ItemPackagingResponse[] = await fetchItemPackaging();
      setItemPackagings(res.map(normalizeItemPackagingResponse));
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadItems = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando Itens...");
    try {
      const res: ItemResponse[] = await fetchItemsApi();
      setItems(res.map(normalizeItemResponse));
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // no-op submit for viewOnly
  const handleSubmit = (_: StockOutModel) => { };

  return (
    <Flex direction="column" justify="start" align="center" className="min-h-screen w-full">
      <Header />
      <Card className="flex-1 w-8/10 sm:w-9/10 h-full sm:my-12 flex-col" style={{ display: "flex" }}>
        <StockOutForm
          initialData={stockOut}
          itemPackagingOptions={itemPackagings}
          itemOptions={items}
          onSubmit={handleSubmit}
          viewOnly={true}
        />
      </Card>
      <LoadingModal isOpen={loadingData.isLoading} message={loadingData.message} />
    </Flex>
  );
}
