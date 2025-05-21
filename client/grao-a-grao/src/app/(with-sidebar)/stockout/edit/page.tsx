"use client";

import StockOutForm from "@/components/Form/StockOutForm";
import { fetchStockOutById, updateStockOut } from "@/api/stock_out_api";
import { fetchItemPackaging } from "@/api/item_packaging_api";
import { fetchItems as fetchItemsApi } from "@/api/items_api";
import { useEffect, useState } from "react";
import { ItemPackagingModel, ItemPackagingResponse, normalizeItemPackagingResponse } from "@/types/item_packaging";
import { ItemModel, ItemResponse, normalizeItemResponse } from "@/types/item";
import { normalizeStockOutResponse, StockOutModel, StockOutResponse, toUpdateStockOutRequest } from "@/types/stock_out";
import { createEmptyStockOut } from "@/util/factory/stock_out";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Flex } from "@radix-ui/themes";
import Header from "@/components/Header";
import LoadingModal from "@/components/LoadingModal";
import { useLoading } from "@/hooks/useLoading";
import { toast } from "sonner";
import { InvalidPackagingQuantityError, InvalidTotalQuantityError, MissingItemIdError, MissingPackagingIdError, MissingPackagingsError, NoItemsError, NonFractionablePackagingError } from "@/errors/stockOutValidation";

export default function StockOutEditPage() {
  const router = useRouter();

  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [stockOut, setStockOut] = useState<StockOutModel>(createEmptyStockOut());
  const [itemPackagings, setItemPackagings] = useState<ItemPackagingModel[]>([]);
  const [items, setItems] = useState<ItemModel[]>([]);

  const { loadingData, setIsLoading, setMessage: setLoadingMessage } = useLoading();

  useEffect(() => {
    if (idParam) fetchStockOut();
  }, [idParam]);

  useEffect(() => {
    fetchItemPackagings();
    fetchItems();
  }, []);

  const fetchStockOut = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando Saída de Estoque...");
    try {
      const resp: StockOutResponse = await fetchStockOutById(parseInt(idParam ?? ""));
      setStockOut(normalizeStockOutResponse(resp));
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro inesperado ao carregar Saída de Estoque.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItemPackagings = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando Fracionamentos de Itens...");
    try {
      const res: ItemPackagingResponse[] = await fetchItemPackaging();
      setItemPackagings(res.map(normalizeItemPackagingResponse));
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro inesperado ao carregar Fracionamentos de Itens.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItems = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando Itens de Estoque...");
    try {
      const res: ItemResponse[] = await fetchItemsApi();
      setItems(res.map(normalizeItemResponse));
    } catch (err) {
      console.error(err);
      toast.error("Ocorreu um erro inesperado ao carregar Itens de Estoque.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: StockOutModel) => {
    setIsLoading(true);
    setLoadingMessage("Salvando Saída de Estoque...");
    try {
      const req = toUpdateStockOutRequest(data);
      await updateStockOut(req);

      router.push("/stockout");
      toast.success("Saída editada com sucesso!");

    } catch (err) {
      console.error(err);

      if (err instanceof NoItemsError) {
        toast.error("É necessário adicionar pelo menos um item.");
      } else if (err instanceof MissingItemIdError) {
        toast.error("É necessário adicionar pelo menos um item.");
      } else if (err instanceof InvalidTotalQuantityError) {
        toast.error("A quantidade total deve ser maior que 0.");
      } else if (err instanceof MissingPackagingsError) {
        toast.error("É necessário adicionar pelo menos um fracionamento.");
      } else if (err instanceof NonFractionablePackagingError) {
        toast.error("Item não fracionável não pode ter fracionamentos.");
      } else if (err instanceof InvalidPackagingQuantityError) {
        toast.error("A quantidade de fracionamento deve ser maior que 0.");
      } else if (err instanceof MissingPackagingIdError) {
        toast.error("Todo fracionamento deve ter um tipo selecionado.");
      } else {
        toast.error("Erro inesperado ao criar saída.");
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex direction="column" justify="start" align="center" className="min-h-screen w-full">
      <Header />
      <Card className="flex-1 w-8/10 sm:w-9/10 h-full sm:my-12 flex-col" style={{ display: "flex" }}>
        <StockOutForm
          initialData={stockOut}
          itemPackagingOptions={itemPackagings}
          itemOptions={items}
          onSubmit={handleSubmit}
        />
      </Card>
      <LoadingModal isOpen={loadingData.isLoading} message={loadingData.message} />
    </Flex>
  );
}