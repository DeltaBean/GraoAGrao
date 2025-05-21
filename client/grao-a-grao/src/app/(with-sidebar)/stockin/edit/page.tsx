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
import { InvalidBuyPriceError, InvalidPackagingQuantityError, InvalidTotalQuantityError, MissingItemIdError, MissingPackagingIdError, MissingPackagingsError, NoItemsError, NonFractionablePackagingError } from "@/errors/stockInValidation";

export default function StockInEditPage() {
    const router = useRouter();

    const searchParams = useSearchParams();
    const idParam = searchParams.get("id");

    const [stockIn, setStockIn] = useState<StockInModel>(createEmptyStockIn());

    const [itemPackagings, setItemPackagings] = useState<ItemPackagingModel[]>([]);
    const [items, setItems] = useState<ItemModel[]>([]);
    const [, setError] = useState<string | null>(null);

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
    }, []);

    const fetchStockIn = async () => {
        setIsLoading(true);
        setLoadingMessage("Carregando Entrada de Estoque...")

        try {
            const stockInResponse: StockInResponse = await fetchStockInById(parseInt(idParam ?? ""));
            const stockInModel: StockInModel = normalizeStockInResponse(stockInResponse);

            setStockIn(stockInModel);
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                setError(err.message);
            } else {
                console.error(String(err));
                setError(String(err));
            }

            toast.error("Ocorreu um erro inesperado ao carregar Entrada de Estoque.");
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
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                setError(err.message);
            } else {
                console.error(String(err));
                setError(String(err));
            }

            toast.error("Ocorreu um erro inesperado ao carregar Fracionamento de Itens.");
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
        } catch (err) {
            if (err instanceof Error) {
                console.error(err.message);
                setError(err.message);
            } else {
                console.error(String(err));
                setError(String(err));
            }

            toast.error("Ocorreu um erro inesperado ao carregar Itens de Estoque.");
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
            toast.success("Entrada editada com sucesso!");
        } catch (err) {
            console.error(err);

            if (err instanceof NoItemsError) {
                toast.error("É necessário adicionar pelo menos um item.");
            } else if (err instanceof MissingItemIdError) {
                toast.error("É necessário adicionar pelo menos um item.");
            } else if (err instanceof InvalidBuyPriceError) {
                toast.error("O preço de compra deve ser maior que 0.");
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
                toast.error("Erro ao criar entrada.");
            }

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
