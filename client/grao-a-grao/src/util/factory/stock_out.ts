import {
    StockOutModel,
    StockOutItemModel,
    StockOutPackagingModel,
  } from "@/types/stock_out";
  
  /**
   * Creates a new, empty packaging entry for a StockOutItem.
   */
  export function createEmptyStockOutPackaging(): StockOutPackagingModel {
    return {
      id: undefined,
      item_packaging: {
        id: undefined,
        description: "",
        quantity: 0,
      },
      quantity: 1, // default to one packaging unit
    };
  }
  
  /**
   * Creates a new, empty StockOutItem with a single empty packaging.
   */
  export function createEmptyStockOutItem(): StockOutItemModel {
    return {
      id: undefined,
      item: {
        id: undefined,
        description: "",
        is_fractionable: true,
      },
      total_quantity: 0,
      packagings: [createEmptyStockOutPackaging()],
    };
  }
  
  /**
   * Creates a new, empty StockOut with one empty item.
   */
  export function createEmptyStockOut(): StockOutModel {
    return {
      id: undefined,
      status: "draft",
      items: [createEmptyStockOutItem()],
      created_at: undefined,
      updated_at: undefined,
    };
  }
  