import { InvalidBuyPriceError, InvalidPackagingQuantityError, InvalidTotalQuantityError, MissingItemIdError, MissingPackagingIdError, MissingPackagingsError, MissingStockInIdError, NoItemsError, NonFractionablePackagingError } from "@/errors/stockInValidation";
import { ItemModel, ItemResponse, normalizeItemResponse } from "./item";
import { ItemPackagingModel, ItemPackagingResponse, normalizeItemPackagingResponse } from "./item_packaging";

// Frontend model
export interface StockInModel {
  id?: number;
  status?: string;
  items: StockInItemModel[];
  created_at?: string;
  updated_at?: string;
  finalized_at?: string;
}

export interface StockInItemModel {
  id?: number;
  item: ItemModel;
  buy_price: number;
  total_quantity: number;
  packagings: StockInPackagingModel[];
}

export interface StockInPackagingModel {
  id?: number;
  item_packaging: ItemPackagingModel;
  quantity: number;
}

// Request DTOs
export interface CreateStockInRequest {
  items: CreateStockInItemRequest[];
}

export interface CreateStockInItemRequest {
  item_id: number;
  buy_price: number;
  total_quantity: number;
  packagings: CreateStockInPackagingRequest[];
}

export interface CreateStockInPackagingRequest {
  item_packaging_id: number;
  quantity: number;
}

export interface UpdateStockInRequest {
  id: number;
  items: UpdateStockInItemRequest[];
}

export interface UpdateStockInItemRequest {
  id?: number;
  item_id: number;
  buy_price: number;
  total_quantity: number;
  packagings: UpdateStockInPackagingRequest[];
}

export interface UpdateStockInPackagingRequest {
  id?: number;
  item_packaging_id: number;
  quantity: number;
}

// Response DTOs
export interface StockInResponse {
  id: number;
  status: string;
  items: StockInItemResponse[];
  created_at: string;
  updated_at: string;
  finalized_at: string;
}

export interface StockInItemResponse {
  id: number;
  item: ItemResponse;
  buy_price: number;
  total_quantity: number;
  packagings: StockInPackagingResponse[];
}

export interface StockInPackagingResponse {
  id: number;
  item_packaging: ItemPackagingResponse;
  quantity: number;
}

/**
 * Safely normalize API response into frontend model,
 * handling potential null or undefined arrays.
 */
export function normalizeStockInResponse(
  res: StockInResponse
): StockInModel {
  return {
    id: res.id,
    status: res.status,
    created_at: res.created_at ?? undefined,
    updated_at: res.updated_at ?? undefined,
    finalized_at: res.finalized_at ?? undefined,
    items: (res.items ?? []).map((item: StockInItemResponse): StockInItemModel => ({
      id: item.id,
      item: normalizeItemResponse(item.item),
      buy_price: item.buy_price,
      total_quantity: item.total_quantity,
      packagings: (item.packagings ?? []).map(pkg => ({
        id: pkg.id,
        item_packaging: normalizeItemPackagingResponse(pkg.item_packaging),
        quantity: pkg.quantity,
      })),
    })),
  };
}


// Convert frontend model to Create request
export function toCreateStockInRequest(model: StockInModel): CreateStockInRequest {
  if (!model.items || model.items.length === 0) throw new NoItemsError();

  return {
    items: model.items.map(item => {
      if (item.item.id === undefined) throw new MissingItemIdError();

      if (item.buy_price <= 0) throw new InvalidBuyPriceError();

      if (item.total_quantity <= 0) throw new InvalidTotalQuantityError();

      // Validation conditioned to item fractionability
      if (!item.item.is_fractionable) {
        // non fractionable
        if (item.packagings.length > 0) throw new NonFractionablePackagingError();
      } else {
        // fractionable
        if (!item.packagings || item.packagings.length === 0) throw new MissingPackagingsError();
      }


      return {
        item_id: item.item.id,
        buy_price: item.buy_price,
        total_quantity: item.total_quantity,
        packagings: item.packagings.map(pkg => {

          if (pkg.item_packaging.id === undefined) throw new MissingPackagingIdError();
          if (pkg.quantity <= 0) throw new InvalidPackagingQuantityError();
          
          return {
            item_packaging_id: pkg.item_packaging.id,
            quantity: pkg.quantity,
          };
        }),
      };
    }),
  };
}

// Convert frontend model to Update request
export function toUpdateStockInRequest(model: StockInModel): UpdateStockInRequest {
  if (model.id === undefined) throw new MissingStockInIdError();

  if (!model.items || model.items.length === 0) throw new NoItemsError();

  return {
    id: model.id,
    items: model.items.map(item => {

      if (item.item.id === undefined) throw new MissingItemIdError();

      if (item.buy_price <= 0) throw new InvalidBuyPriceError();

      if (item.total_quantity <= 0) throw new InvalidTotalQuantityError();

      // Validation conditioned to item fractionability
      if (!item.item.is_fractionable) {
        // non fractionable
        if (item.packagings.length > 0) throw new NonFractionablePackagingError();
      } else {
        // fractionable
        if (!item.packagings || item.packagings.length === 0) throw new MissingPackagingsError();
      }

      return {
        id: item.id,
        item_id: item.item.id,
        buy_price: item.buy_price,
        total_quantity: item.total_quantity,
        packagings: item.packagings.map(pkg => {

          if (pkg.item_packaging.id === undefined) throw new MissingPackagingIdError();
          if (pkg.quantity <= 0) throw new InvalidPackagingQuantityError();

          return {
            id: pkg.id,
            item_packaging_id: pkg.item_packaging.id,
            quantity: pkg.quantity,
          };
        }),
      };
    }),
  };
}