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
}

// Frontend UI model
export interface ItemModel {
    id?: number;
    description: string;
    ean13?: string;
    category?: CategoryModel;
    unit_of_measure?: UnitOfMeasureModel;
    created_at?: Date;
    updated_at?: Date;
}

export function normalizeItemResponse(res: ItemResponse): ItemModel {
    return {
        id: res.id,
        description: res.description,
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
  
    if (!model.ean13) {
      throw new Error("Item EAN-13 is required.");
    }
  
    if (!model.category || typeof model.category.id !== "number") {
      throw new Error("Category with a valid ID is required.");
    }
  
    if (!model.unit_of_measure || typeof model.unit_of_measure.id !== "number") {
      throw new Error("Unit of Measure with a valid ID is required.");
    }
  
    return {
      id: model.id, // optional, can be undefined
      description: model.description,
      ean13: model.ean13,
      category_id: model.category.id,
      unit_of_measure_id: model.unit_of_measure.id,
    };
  }
