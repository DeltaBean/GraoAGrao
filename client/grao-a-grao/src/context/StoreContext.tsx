// context/StoreContext.tsx
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { StoreModel, normalizeStoreResponse } from "@/types/store";
import * as storesApi from "@/api/stores_api";
import { toast } from "sonner";
import { CreateStoreData, UpdateStoreData } from "@/schemas/store_schema";
import { createEmptyStore } from "@/util/factory/store";

interface StoreContextType {
    stores: StoreModel[];
    selectedStore: StoreModel | null;
    setSelectedStore: (store: StoreModel) => void;
    fetchStores: () => Promise<void>;
    createStore: (data: CreateStoreData) => Promise<void>;
    updateStore: (data: UpdateStoreData) => Promise<void>;
    deleteStore: (id: number) => Promise<void>;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [stores, setStores] = useState<StoreModel[]>([]);
    const [selectedStore, setSelectedStoreState] = useState<StoreModel | null>(
        typeof window !== "undefined"
            ? JSON.parse(sessionStorage.getItem("selectedStore") ?? "null")
            : null
    );

    const fetchStores = async () => {
        try {
            const res = await storesApi.fetchStores();
            const normalized = res.map(normalizeStoreResponse);
            setStores(normalized);

            // Set default store if none selected
            if (!selectedStore && normalized.length > 0) {
                setSelectedStore(normalized[0]);
            }
        } catch (err: any) {
            console.error(err);
            toast.error("Erro ao carregar lojas");
        }
    };

    useEffect(() => {
        fetchStores();
    }, []);

    const setSelectedStore = (store: StoreModel) => {
        sessionStorage.setItem("selectedStore", JSON.stringify(store));
        setSelectedStoreState(store);
    };

    const createStore = async (data: CreateStoreData) => {
        const created = normalizeStoreResponse(await storesApi.createStore(data));
        setStores((prev) => [...prev, created]);

        toast.success("Loja criada com sucesso!");
        if (selectedStore?.id == createEmptyStore().id) {
            setSelectedStore(created)
            toast.info(`Loja ativa alterada para ${created.name}`);
        }
    };

    const updateStore = async (data: UpdateStoreData) => {
        const updated = normalizeStoreResponse(await storesApi.updateStore(data));
        setStores((prev) =>
            prev.map((s) => (s.id === updated.id ? updated : s))
        );

        toast.success("Loja editada com sucesso!");

        if (selectedStore?.id == updated.id) {
            setSelectedStore(updated);
            toast.info(`Loja ativa alterada para ${updated.name}`);
        }
    };

    const deleteStore = async (id: number) => {
        await storesApi.deleteStore(id);
        setStores((prev) => prev.filter((s) => s.id !== id));

        toast.success("Loja deletada com sucesso!");

        if (selectedStore?.id == id) {
            setSelectedStore(createEmptyStore());
            toast.info("Selecione uma nova loja ativa");
        }
    };

    return (
        <StoreContext.Provider
            value={{
                stores,
                selectedStore,
                setSelectedStore,
                fetchStores,
                createStore,
                updateStore,
                deleteStore,
            }}
        >
            {children}
        </StoreContext.Provider>
    );
}

export const useStoreContext = () => {
    const context = useContext(StoreContext);
    if (!context) {
        throw new Error("useStore must be used within a StoreProvider");
    }
    return context;
};
