import { CategoryModel } from "./category";
import { UnitOfMeasureModel } from "./unit_of_measure";

// Used to send data to the backend (POST/PUT)
export interface ItemRequest {
    id?: number; // Optional: only used for update
    description: string;
    ean13: string;
    category_id: number;
    unit_of_measure_id: number;
}

// Received from the backend
export interface ItemResponse {
    item_id: number;
    item_description: string;
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
}

// Frontend UI model
export interface ItemModel {
    item_id: number;
    item_description: string;
    ean13: string;
    category: CategoryModel;
    unit_of_measure: UnitOfMeasureModel;
    created_at: Date;
    updated_at: Date;
}

export function normalizeItemResponse(res: ItemResponse): ItemModel {
    return {
        item_id: res.item_id,
        item_description: res.item_description,
        ean13: res.ean13,
        category: {
            ...res.category,
            created_at: new Date(res.category.created_at),
            updated_at: new Date(res.category.updated_at),
        },
        unit_of_measure: res.unit_of_measure,
        created_at: new Date(res.created_at),
        updated_at: new Date(res.updated_at),
    };
}

export function toItemRequest(model: ItemModel): ItemRequest {
    return {
        id: model.item_id,
        description: model.item_description,
        ean13: model.ean13,
        category_id: model.category.id,
        unit_of_measure_id: model.unit_of_measure.id,
    };
}
