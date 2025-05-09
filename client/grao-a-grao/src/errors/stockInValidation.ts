/**
 * Base class for all StockIn validation errors
 */
export class StockInValidationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "StockInValidationError";
    }
  }
  
  /** Missing at least one item in the payload */
  export class NoItemsError extends StockInValidationError {
    constructor() {
      super("At least one item must be added to Stock In.");
      this.name = "NoItemsError";
    }
  }
  
  /** Missing the overall StockIn ID when updating */
  export class MissingStockInIdError extends StockInValidationError {
    constructor() {
      super("Stock In ID is required for update.");
      this.name = "MissingStockInIdError";
    }
  }
  
  /** Missing or invalid Item ID on an item row */
  export class MissingItemIdError extends StockInValidationError {
    constructor() {
      super("Item ID is required for each item.");
      this.name = "MissingItemIdError";
    }
  }
  
  /** Buy price ≤ 0 */
  export class InvalidBuyPriceError extends StockInValidationError {
    constructor() {
      super("Buy Price must be greater than 0.");
      this.name = "InvalidBuyPriceError";
    }
  }
  
  /** Total quantity ≤ 0 */
  export class InvalidTotalQuantityError extends StockInValidationError {
    constructor() {
      super("Total Quantity must be greater than 0.");
      this.name = "InvalidTotalQuantityError";
    }
  }
  
  /** Non‐fractionable item had packagings */
  export class NonFractionablePackagingError extends StockInValidationError {
    constructor() {
      super("Non‐fractionable items cannot have packagings.");
      this.name = "NonFractionablePackagingError";
    }
  }
  
  /** Fractionable item but no packagings provided */
  export class MissingPackagingsError extends StockInValidationError {
    constructor() {
      super("At least one packaging must be specified for each item.");
      this.name = "MissingPackagingsError";
    }
  }
  
  /** Missing Packaging ID on a packaging row */
  export class MissingPackagingIdError extends StockInValidationError {
    constructor() {
      super("Item Packaging ID is required for each packaging.");
      this.name = "MissingPackagingIdError";
    }
  }
  
  /** Packaging quantity ≤ 0 */
  export class InvalidPackagingQuantityError extends StockInValidationError {
    constructor() {
      super("Packaging quantity must be greater than 0.");
      this.name = "InvalidPackagingQuantityError";
    }
  }
  