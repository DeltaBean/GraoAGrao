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
  StockOutModel,
  toCreateStockOutRequest,
} from "@/types/stock_out";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { InvalidPackagingQuantityError, InvalidTotalQuantityError, MissingItemIdError, MissingPackagingIdError, MissingPackagingsError, NoItemsError, NonFractionablePackagingError } from "@/errors/stockOutValidation";
import { useLoading } from "@/hooks/useLoading";
import LoadingModal from "@/components/LoadingModal";

export default function StockOutCreatePage() {
  const router = useRouter();

  const [itemPackagings, setItemPackagings] = useState<ItemPackagingModel[]>([]);
  const [items, setItems] = useState<ItemModel[]>([]);
  const { loadingData, setIsLoading, setMessage: setLoadingMessage } = useLoading();

  useEffect(() => {
    fetchItemPackagings();
    fetchItems();
  }, []);

  const fetchItemPackagings = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando Fracionamentos de Itens...");
    try {
      const resp: ItemPackagingResponse[] = await item_pack_api.fetchItemPackaging();
      setItemPackagings(resp.map(sp => normalizeItemPackagingResponse(sp)));
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }

      toast.error("Ocorreu um erro inesperado ao carregar Fracionamentos de Itens.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchItems = async () => {
    setIsLoading(true);
    setLoadingMessage("Carregando Itens...");
    try {
      const resp: ItemResponse[] = await item_api.fetchItems();
      setItems(resp.map(it => normalizeItemResponse(it)));
    } catch (err) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error(String(err));
      }

      toast.error("Ocorreu um erro inesperado ao carregar Itens.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: StockOutModel) => {
    setIsLoading(true);
    setLoadingMessage("Salvando Saída de Estoque...");

    try {

      const req = toCreateStockOutRequest(data);
      await createStockOut(req);

      router.push("/stockout");
      toast.success("Saída criada com sucesso!");

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
        toast.error("Erro ao criar saída.");
      }
    } finally {
      setIsLoading(false);
    }
  }


  return (
    <Flex direction="column" justify="start" align="center" className="min-h-screen w-full">
      <Header />
      <Card
        id="main-flex"
        className="flex-1 w-8/10 sm:w-9/10 h-full sm:my-12 flex-col"
        style={{ display: "flex" }}
      >
        <StockOutForm
          itemOptions={items}
          itemPackagingOptions={itemPackagings}
          onSubmit={handleSubmit}
        />
      </Card>
      <LoadingModal isOpen={loadingData.isLoading} message={loadingData.message} />
    </Flex>
  );
}