// Used for POST and PUT requests
export interface UnitOfMeasureRequest {
    id?: number; // optional for creation
    description: string;
}

// Used when receiving data from the backend
export interface UnitOfMeasureResponse {
    id: number;
    description: string;
}

// Internal UI model (can be extended later with local-only state)
export interface UnitOfMeasureModel {
    id?: number;
    description: string;
}

export function normalizeUnitOfMeasureResponse(res: UnitOfMeasureResponse): UnitOfMeasureModel {
    return {
        id: res.id,
        description: res.description,
    };
}

export function toUnitOfMeasureRequest(model: UnitOfMeasureModel): UnitOfMeasureRequest {
    return {
        id: model.id,
        description: model.description,
    };
}