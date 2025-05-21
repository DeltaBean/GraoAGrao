/**
 * Base class for all StockOut validation errors
 */
export class StockOutValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "StockOutValidationError";
    }
  }
  
  /** Missing at least one item in the payload */
  export class NoItemsError extends StockOutValidationError {
    constructor() {
      super("At least one item must be added to Stock Out.");
      this.name = "NoItemsError";
    }
  }
  
  /** Missing the overall StockOut ID when updating */
  export class MissingStockOutIdError extends StockOutValidationError {
    constructor() {
      super("Stock Out ID is required for update.");
      this.name = "MissingStockOutIdError";
    }
  }
  
  /** Missing or invalid Item ID on an item row */
  export class MissingItemIdError extends StockOutValidationError {
    constructor() {
      super("Item ID is required for each item.");
      this.name = "MissingItemIdError";
    }
  }
  
  
  /** Total quantity ≤ 0 */
  export class InvalidTotalQuantityError extends StockOutValidationError {
    constructor() {
      super("Total Quantity must be greater than 0.");
      this.name = "InvalidTotalQuantityError";
    }
  }
  
  /** Non‐fractionable item had packagings */
  export class NonFractionablePackagingError extends StockOutValidationError {
    constructor() {
      super("Non‐fractionable items cannot have packagings.");
      this.name = "NonFractionablePackagingError";
    }
  }
  
  /** Fractionable item but no packagings provided */
  export class MissingPackagingsError extends StockOutValidationError {
    constructor() {
      super("At least one packaging must be specified for each item.");
      this.name = "MissingPackagingsError";
    }
  }
  
  /** Missing Packaging ID on a packaging row */
  export class MissingPackagingIdError extends StockOutValidationError {
    constructor() {
      super("Item Packaging ID is required for each packaging.");
      this.name = "MissingPackagingIdError";
    }
  }
  
  /** Packaging quantity ≤ 0 */
  export class InvalidPackagingQuantityError extends StockOutValidationError {
    constructor() {
      super("Packaging quantity must be greater than 0.");
      this.name = "InvalidPackagingQuantityError";
    }
  }
  