export const ErrorCodes = {
    DELETE_REFERENCED_ENTITY: "DELETE_REFERENCED_ENTITY",
    FOREIGN_KEY_REFERENCE_MISSING: "FOREIGN_KEY_REFERENCE_MISSING",
    GENERIC_DATABASE_ERROR: "GENERIC_DATABASE_ERROR",
    STOCK_IN_TOTAL_QUANTITY_WRONG: "STOCK_IN_TOTAL_QUANTITY_WRONG",
    STOCK_OUT_TOTAL_QUANTITY_WRONG: "STOCK_OUT_TOTAL_QUANTITY_WRONG",
} as const;

export interface GenericPostgreSQLErrorResponse {
    error: string;
    code: string;
    details: string;
}

export interface ForeignKeyDeleteReferencedErrorResponse<T = unknown> {
    error: string;
    code: string;
    internal_code: string;
    details: string;
    referencedTable: string;
    referencingEntities: T[];
}

export interface ForeignKeyReferenceMissingErrorResponse {
    error: string;
    code: string;
    internal_code: string;
    details: string;
    referencedTable: string;
}

export interface StockInTotalQuantityNotMatchingResponse {
    error: string;
    code: string;
    internal_code: string;
    details: string;
}

export interface StockOutTotalQuantityNotMatchingResponse {
    error: string;
    code: string;
    internal_code: string;
    details: string;
}