export interface StoreModel {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface CreateStoreRequest {
    name: string;
}

export interface UpdateStoreRequest {
    store_id: number;
    name: string;
}

export interface StoreResponse {
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
}

// Normalize StoreResponse → StoreModel
export function normalizeStoreResponse(res: StoreResponse): StoreModel {
    return {
      id: res.id,
      name: res.name,
      created_at: res.created_at,
      updated_at: res.updated_at,
    };
  }
  
  // Convert StoreModel → UpdateStoreRequest
  export function toUpdateStoreRequest(model: StoreModel): UpdateStoreRequest {
    return {
      store_id: model.id,
      name: model.name,
    };
  }