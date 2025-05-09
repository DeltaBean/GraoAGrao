import { ItemModel, ItemResponse, normalizeItemResponse } from "./item";
import { ItemPackagingModel, ItemPackagingResponse, normalizeItemPackagingResponse } from "./item_packaging";

// Frontend model
export interface StockOutModel {
    id?: number;
    status?: string;
    items: StockOutItemModel[];
    created_at?: string;
    updated_at?: string;
    finalized_at?: string;
}

export interface StockOutItemModel {
    id?: number;
    item: ItemModel;
    total_quantity: number;
    packagings: StockOutPackagingModel[];
}

export interface StockOutPackagingModel {
    id?: number;
    item_packaging: ItemPackagingModel;
    quantity: number;
}

// Request DTOs
export interface CreateStockOutRequest {
    items: CreateStockOutItemRequest[];
}

export interface CreateStockOutItemRequest {
    item_id: number;
    total_quantity: number;
    packagings: CreateStockOutPackagingRequest[];
}

export interface CreateStockOutPackagingRequest {
    item_packaging_id: number;
    quantity: number;
}

export interface UpdateStockOutRequest {
    id: number;
    items: UpdateStockOutItemRequest[];
}

export interface UpdateStockOutItemRequest {
    id?: number;
    item_id: number;
    total_quantity: number;
    packagings: UpdateStockOutPackagingRequest[];
}

export interface UpdateStockOutPackagingRequest {
    id?: number;
    item_packaging_id: number;
    quantity: number;
}

// Response DTOs
export interface StockOutResponse {
    id: number;
    status: string;
    items: StockOutItemResponse[];
    created_at: string;
    updated_at: string;
    finalized_at: string;
}

export interface StockOutItemResponse {
    id: number;
    item: ItemResponse;
    total_quantity: number;
    packagings: StockOutPackagingResponse[];
}

export interface StockOutPackagingResponse {
    id: number;
    item_packaging: ItemPackagingResponse;
    quantity: number;
}

export function normalizeStockOutResponse(res: StockOutResponse): StockOutModel {
    return {
        id: res.id,
        status: res.status,
        created_at: res.created_at ?? undefined,
        updated_at: res.updated_at ?? undefined,
        finalized_at: res.finalized_at ?? undefined,
        items: (res.items ?? []).map((item): StockOutItemModel => ({
            id: item.id,
            item: normalizeItemResponse(item.item),
            total_quantity: item.total_quantity,
            packagings: (item.packagings ?? []).map(pkg => ({
                id: pkg.id,
                item_packaging: normalizeItemPackagingResponse(pkg.item_packaging),
                quantity: pkg.quantity,
            })),
        })),
    };
}

export function toCreateStockOutRequest(model: StockOutModel): CreateStockOutRequest {
    if (!model.items || model.items.length === 0) {
        throw new Error("At least one item must be added to Stock Out.");
    }

    return {
        items: model.items.map(item => {
            if (item.item.id === undefined) {
                throw new Error("Item ID is required for each item.");
            }
            if (item.total_quantity <= 0) {
                throw new Error("Total Quantity must be greater than 0.");
            }

            if (!item.item.is_fractionable && item.packagings.length > 0) {
                throw new Error("Item não fracionável não pode conter fracionamento.");
            }

            if (item.item.is_fractionable && (!item.packagings || item.packagings.length === 0)) {
                throw new Error("At least one packaging must be specified for fractionable item.");
            }

            return {
                item_id: item.item.id,
                total_quantity: item.total_quantity,
                packagings: item.packagings.map(pkg => {
                    if (pkg.item_packaging.id === undefined) {
                        throw new Error("Item Packaging ID is required for each packaging.");
                    }
                    if (pkg.quantity <= 0) {
                        throw new Error("Packaging quantity must be greater than 0.");
                    }
                    return {
                        item_packaging_id: pkg.item_packaging.id,
                        quantity: pkg.quantity,
                    };
                }),
            };
        }),
    };
}

export function toUpdateStockOutRequest(model: StockOutModel): UpdateStockOutRequest {
    if (model.id === undefined) {
        throw new Error("Stock Out ID is required for update.");
    }

    if (!model.items || model.items.length === 0) {
        throw new Error("At least one item must be added to Stock Out.");
    }

    return {
        id: model.id,
        items: model.items.map(item => {
            if (item.item.id === undefined) {
                throw new Error("Item ID is required for each item.");
            }
            if (item.total_quantity <= 0) {
                throw new Error("Total Quantity must be greater than 0.");
            }
            if (!item.packagings || item.packagings.length === 0) {
                throw new Error("At least one packaging must be specified.");
            }

            return {
                id: item.id,
                item_id: item.item.id,
                total_quantity: item.total_quantity,
                packagings: item.packagings.map(pkg => {
                    if (pkg.item_packaging.id === undefined) {
                        throw new Error("Item Packaging ID is required.");
                    }
                    if (pkg.quantity <= 0) {
                        throw new Error("Packaging quantity must be greater than 0.");
                    }
                    return {
                        id: pkg.id,
                        item_packaging_id: pkg.item_packaging.id,
                        quantity: pkg.quantity,
                    };
                }),
            };
        }),
    };
}
