// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import StockInForm from "@/components/Form/StockInForm";
import { fetchStockInById, updateStockIn } from "@/api/stock_in_api";
import { fetchItemPackaging } from "@/api/item_packaging_api";
import { fetchItems as fetchItemsApi } from "@/api/items_api";
import { useEffect, useState } from "react";
import { ItemPackagingModel, ItemPackagingResponse, normalizeItemPackagingResponse } from "@/types/item_packaging";
import { ItemModel, ItemResponse, normalizeItemResponse } from "@/types/item";
import { normalizeStockInResponse, StockInModel, StockInResponse, toUpdateStockInRequest } from "@/types/stock_in";
import { createEmptyStockIn } from "@/util/factory/stock_in";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Flex } from "@radix-ui/themes";
import Header from "@/components/Header";
import LoadingModal from "@/components/LoadingModal";
import { useLoading } from "@/hooks/useLoading";
import { toast } from "sonner";

export default function StockInEditPage() {
    const router = useRouter();

    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");

    const [stockIn, setStockIn] = useState<StockInModel>(createEmptyStockIn());

    const [itemPackagings, setItemPackagings] = useState<ItemPackagingModel[]>([]);
    const [items, setItems] = useState<ItemModel[]>([]);
    const [error, setError] = useState<string | null>(null);

    const {
        loadingData,
        setIsLoading,
        setMessage: setLoadingMessage,
    } = useLoading();

    useEffect(() => {
        if (idParam) {
            fetchStockIn();
        }
    }, [idParam]);

    useEffect(() => {
        fetchItemPackagings();
        fetchItems();
    }, []); // empty array = run once on mount

    const fetchStockIn = async () => {
        setIsLoading(true);
        setLoadingMessage("Carregando Entrada de Estoque...")

        try {
            const stockInResponse: StockInResponse = await fetchStockInById(parseInt(idParam ?? ""));
            const stockInModel: StockInModel = normalizeStockInResponse(stockInResponse);

            setStockIn(stockInModel);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchItemPackagings = async () => {
        setIsLoading(true);
        setLoadingMessage("Carregando Fracionamento de Itens...");

        try {
            const itemPackagingResponse: ItemPackagingResponse[] = await fetchItemPackaging();
            const itemPackagingModel: ItemPackagingModel[] = itemPackagingResponse.map(
                (sp) => normalizeItemPackagingResponse(sp)
            );

            setItemPackagings(itemPackagingModel ?? []);
        } catch (err: any) {
            console.error(err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchItems = async () => {
        setIsLoading(true);
        setLoadingMessage("Carregando Itens de Estoque...");

        try {
            const itemResponse: ItemResponse[] = await fetchItemsApi();
            const itemModel: ItemModel[] = itemResponse.map(
                (it) => normalizeItemResponse(it)
            );

            setItems(itemModel ?? []);
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleSubmit = async (data: StockInModel) => {
        setIsLoading(true);
        setLoadingMessage("Salvando Entrada de Estoque...")
        try {
            const req = toUpdateStockInRequest(data);
            await updateStockIn(req);
            router.push("/stockin");
            toast.success("Entrada criada com sucesso!");
        } catch (err: any) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Flex direction={"column"} justify={"start"} align={"center"} className="min-h-screen w-full">
            <Header />
            <Card
                id="main-flex"
                className="flex-1 w-8/10 sm:w-9/10 h-full sm:my-12 flex-col"
                style={{ display: "flex" }}
            >
                <StockInForm
                    initialData={stockIn}
                    itemPackagingOptions={itemPackagings}
                    itemOptions={items}
                    onSubmit={handleSubmit}
                />
            </Card>

            <LoadingModal isOpen={loadingData.isLoading} message={loadingData.message} />
        </Flex>
    );
}
