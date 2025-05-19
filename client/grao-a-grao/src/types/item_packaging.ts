import { ItemModel, ItemResponse } from "./item";

// Used for POST and PUT requests
export interface ItemPackagingRequest {
    id?: number; // Optional for create, required for update
    item_id: number;
    description: string;
    quantity: number;
}

// API response format
export interface ItemPackagingResponse {
    id: number;
    description: string;
    quantity: number;
    item: ItemResponse
}

export interface ItemPackagingModel {
    id?: number;
    description: string;
    quantity: number;
    item?: ItemModel
}

export function normalizeItemPackagingResponse(res: ItemPackagingResponse): ItemPackagingModel {
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
            updated_at: new Date(res.item.updated_at)
        },
    };
}

export function toItemPackagingRequest(model: ItemPackagingModel): ItemPackagingRequest {
    
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
