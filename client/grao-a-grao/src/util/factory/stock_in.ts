import { StockInModel, StockInItemModel, StockInPackagingModel } from "@/types/stock_in";

/**
 * Creates a new, empty packaging entry for a StockInItem.
 */
export function createEmptyStockInPackaging(): StockInPackagingModel {
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
 * Creates a new, empty StockInItem with a single empty packaging.
 */
export function createEmptyStockInItem(): StockInItemModel {
  return {
    id: undefined,
    item: {
      id: undefined,
      description: "",
      is_fractionable: true,
    },
    buy_price: 0,
    total_quantity: 0,
    packagings: [createEmptyStockInPackaging()],
  };
}

/**
 * Creates a new, empty StockIn with one empty item.
 */
export function createEmptyStockIn(): StockInModel {
  return {
    id: undefined,
    status: "draft",
    items: [createEmptyStockInItem()],
    created_at: undefined,
    updated_at: undefined,
  };
}
