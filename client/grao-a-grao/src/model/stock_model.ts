import { Item } from "./items_model";

export type StockPackaging ={
    id: number;
    description: string;
    quantity: number;
    item: Item;
}

export type CreateStockPackaging = Omit<StockPackaging, "id" | "item">
    & {item: Pick<Item, "item_id" | "item_description">};
export type UpdateStockPackaging = 
    Omit<StockPackaging, "item"> 
    & {item: Pick<Item, "item_id" | "item_description" >};