export interface GenericPostgreSQLErrorResponse {
    error: string;
    code: string;
    details: string;
}

export interface ForeignKeyDeleteReferencedErrorResponse<T = unknown> {
    error: string;
    code: string;
    details: string;
    referencedTable: string;
    referencingEntities: T[];
  }

export interface ForeignKeyReferenceMissingErrorResponse {
    error: string;
    code: string;
    details: string;
    referencedTable: string;
}