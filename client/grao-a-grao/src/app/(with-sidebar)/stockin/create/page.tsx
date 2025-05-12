// "use client" ensures we can have interactive elements (like hover dropdown) in Next.js 13 app router.
"use client";

import StockInForm from "@/components/Form/StockInForm";
import { createStockIn } from "@/api/stock_in_api"; // your API call
import { ItemPackagingModel, ItemPackagingResponse, normalizeItemPackagingResponse } from "@/types/item_packaging";
import * as item_pack_api from "@/api/item_packaging_api";
import * as item_api from "@/api/items_api"
import { useEffect, useState } from "react";
import { Card, Flex } from "@radix-ui/themes";
import Header from "@/components/Header";
import { ItemModel, ItemResponse, normalizeItemResponse } from "@/types/item";
import { CreateStockInRequest, StockInModel, toCreateStockInRequest } from "@/types/stock_in";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { InvalidBuyPriceError, InvalidPackagingQuantityError, InvalidTotalQuantityError, MissingItemIdError, MissingPackagingIdError, MissingPackagingsError, NoItemsError, NonFractionablePackagingError } from "@/errors/stockInValidation";

export default function StockInCreatePage() {
    const router = useRouter();

    const [itemPackagings, setItemPackagings] = useState<ItemPackagingModel[]>([]);
    const [items, setItems] = useState<ItemModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchItemPackagings();
        fetchItems();
    }, []); // empty array = run once on mount

    const fetchItemPackagings = async () => {
        setLoading(true);

        try {
            const itemPackagingResponse: ItemPackagingResponse[] = await item_pack_api.fetchItemPackaging();
            const itemPackagingModel: ItemPackagingModel[] = itemPackagingResponse.map(
                (sp) => normalizeItemPackagingResponse(sp)
            );

            setItemPackagings(itemPackagingModel ?? []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchItems = async () => {
        setLoading(true);

        try {
            const itemResponse: ItemResponse[] = await item_api.fetchItems();
            const itemModel: ItemModel[] = itemResponse.map(
                (it) => normalizeItemResponse(it)
            );
            setItems(itemModel ?? []);
        } catch (err: any) {

        } finally {
            setLoading(false);
        }
    }

    const handleSubmit = async (data: StockInModel) => {
        try {

            const req = toCreateStockInRequest(data);
            await createStockIn(req);

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
                    itemOptions={items}
                    itemPackagingOptions={itemPackagings}
                    onSubmit={handleSubmit}
                />
            </Card>
        </Flex>
    );
}
