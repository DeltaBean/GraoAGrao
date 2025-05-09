// src/types/stock.ts

import { ItemModel, ItemResponse, normalizeItemResponse } from "@/types/item";

// Frontend model
export interface StockModel {
    id?: number;
    item: ItemModel;
    current_stock: number;
    created_at?: string;
    updated_at?: string;
}

// API response DTO
export interface StockResponse {
    id: number;
    item: ItemResponse;
    current_stock: number;
    created_at: string;
    updated_at: string;
}

/**
 * Normalize API StockResponse into frontend StockModel,
 * converting nested objects and date strings.
 */
export function normalizeStockResponse(res: StockResponse): StockModel {
    return {
        id: res.id,
        item: normalizeItemResponse(res.item),
        current_stock: res.current_stock,
        created_at: res.created_at ?? undefined,
        updated_at: res.updated_at ?? undefined,
    };
}
