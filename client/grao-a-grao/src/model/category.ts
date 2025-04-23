// Category request used for POST and PUT
export interface CategoryRequest {
    id?: number; // Optional: only used for update
    description: string;
}

// Response returned from the backend
export interface CategoryResponse {
    id: number;
    description: string;
    created_at: string; // ISO string
    updated_at: string;
}

// Internal model used in frontend components (editable, typed)
export interface CategoryModel {
    id: number;
    description: string;
    created_at: Date;
    updated_at: Date;
}

export function normalizeCategoryResponse(res: CategoryResponse): CategoryModel {
    return {
        id: res.id,
        description: res.description,
        created_at: new Date(res.created_at),
        updated_at: new Date(res.updated_at),
    };
}

export function toCategoryRequest(model: CategoryModel): CategoryRequest {
    return {
        id: model.id,
        description: model.description,
    };
}