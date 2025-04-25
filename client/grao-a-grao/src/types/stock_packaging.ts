import { ItemModel } from "./item";

// Used for POST and PUT requests
export interface StockPackagingRequest {
    id?: number; // Optional for create, required for update
    item_id: number;
    description: string;
    quantity: number;
}

// API response format
export interface StockPackagingResponse {
    id: number;
    description: string;
    quantity: number;
    item: {
        id: number;
        description: string;
        ean13: string;
        category: {
            id: number;
            description: string;
            created_at: string;
            updated_at: string;
        };
        unit_of_measure: {
            id: number;
            description: string;
        };
        created_at: string;
        updated_at: string;
    };
}

export interface StockPackagingModel {
    id?: number;
    description: string;
    quantity: number;
    item?: ItemModel
}

export function normalizeStockPackagingResponse(res: StockPackagingResponse): StockPackagingModel {
    return {
        id: res.id,
        description: res.description,
        quantity: res.quantity,
        item: {
            ...res.item,
            category: {
                ...res.item.category,
                created_at: new Date(res.item.category.created_at),
                updated_at: new Date(res.item.category.updated_at),
            },
            created_at: new Date(res.item.created_at),
            updated_at: new Date(res.item.updated_at),
        },
    };
}

export function toStockPackagingRequest(model: StockPackagingModel): StockPackagingRequest {
    
    if (!model.item || typeof model.item.id !== "number") {
        throw new Error("Item with a valid ID is required.");
    }

    return {
        id: model.id,
        description: model.description,
        quantity: model.quantity,
        item_id: model.item.id,
    };
}
