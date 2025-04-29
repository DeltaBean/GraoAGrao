import { ItemModel, ItemResponse, normalizeItemResponse } from "./item";
import { ItemPackagingModel, ItemPackagingResponse, normalizeItemPackagingResponse } from "./item_packaging";

export interface StockInModel {
    id?: number;
    items: StockInItemModel[];
    created_at?: string;
    updated_at?: string;
}

export interface StockInItemModel {
    id?: number;
    item: ItemModel;
    item_packaging: ItemPackagingModel;
    buy_price?: number;
    quantity?: number;
}

export interface CreateStockInRequest {
    items: CreateStockInItemRequest[];
}

export interface CreateStockInItemRequest {
    item_packaging_id: number;
    item_id: number;
    buy_price: number;
    quantity: number;
}

// Used to send data to backend (PUT)
export interface UpdateStockInRequest {
    id: number;
    items: UpdateStockInItemRequest[];
}

export interface UpdateStockInItemRequest {
    id?: number; // optional because API uses null for new items
    item_packaging_id: number;
    item_id: number;
    buy_price: number;
    quantity: number;
}

export interface StockInResponse {
    id: number;
    items: StockInItemResponse[];
    created_at: string;
    updated_at: string;
}

export interface StockInItemResponse {
    id: number;
    item: ItemResponse;
    item_packaging: ItemPackagingResponse;
    buy_price: number;
    quantity: number;
}

export function normalizeStockInResponse(res: StockInResponse): StockInModel {
    return {
        id: res.id,
        created_at: String(res.created_at),
        updated_at: String(res.updated_at),
        items: res.items.map(item => ({
            id: item.id,
            item: normalizeItemResponse(item.item),
            item_packaging: normalizeItemPackagingResponse(item.item_packaging),
            buy_price: item.buy_price,
            quantity: item.quantity,
        })),
    };
}

export function toCreateStockInRequest(model: StockInModel): CreateStockInRequest {
    if (!model.items || model.items.length === 0) {
        throw new Error("At least one item must be added to Stock In.");
    }

    return {
        items: model.items.map(item => {

            if (item.item.id === undefined) {
                throw new Error("Item ID is required for each item.");
            }
            if (item.item_packaging.id === undefined) {
                throw new Error("Item Packaging ID is required for each item.");
            }
            if (item.buy_price === undefined || item.buy_price <= 0) {
                throw new Error("Buy Price must be greater than 0.");
            }
            if (item.quantity === undefined || item.quantity <= 0) {
                throw new Error("Quantity must be greater than 0.");
            }

            return {
                item_id: item.item.id,
                item_packaging_id: item.item_packaging.id,
                buy_price: item.buy_price,
                quantity: item.quantity,
            };
        }),
    };
}

export function toUpdateStockInRequest(model: StockInModel): UpdateStockInRequest {
    if (model.id === undefined) {
        throw new Error("Stock In ID is required for update.");
    }
    if (!model.items || model.items.length === 0) {
        throw new Error("At least one item must be added to Stock In.");
    }

    return {
        id: model.id,
        items: model.items.map(item => {

             if (item.item.id === undefined) {
                throw new Error("Item ID is required for each item.");
            }
            if (item.item_packaging.id === undefined) {
                throw new Error("Item Packaging ID is required for each item.");
            }
            if (item.buy_price === undefined || item.buy_price <= 0) {
                throw new Error("Buy Price must be greater than 0.");
            }
            if (item.quantity === undefined || item.quantity <= 0) {
                throw new Error("Quantity must be greater than 0.");
            }
            return {
                id: item.id, // optional (for new items, it will be undefined)
                item_id: item.item.id,
                item_packaging_id: item.item_packaging.id,
                buy_price: item.buy_price,
                quantity: item.quantity,
            };
        }),
    };
}