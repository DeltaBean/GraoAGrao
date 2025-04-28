import { ItemPackagingModel } from "./item_packaging";

export interface StockInModel {
    id?: number;
    itemPackagings: ItemPackagingModel[];
    created_at: string;
    updated_at: string;
}