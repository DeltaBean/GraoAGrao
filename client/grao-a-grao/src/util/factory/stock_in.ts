import { StockInModel, StockInItemModel } from "@/types/stock_in";

export function createEmptyStockInItem(): StockInItemModel {
    return {
      item: {
        description: "",
      },
      item_packaging: {
        description: "",
        quantity: 0,
      },
      quantity: 0,
      buy_price: undefined,
    };
  }

// Create an empty StockIn (the whole form)
export function createEmptyStockIn(): StockInModel {
    return {
        items: [createEmptyStockInItem()],
        created_at: undefined,
        updated_at: undefined,
    };
}