export type Item = {
    item_id: number;
    item_description: string;
    ean13: string;
    unit_of_measure: UnitOfMeasure;
    category: Category;
};
export type CreateItemInput = Omit<Item, "item_id">
export type UpdateItemInput = Item

export type ItemOption = Pick<Item, "item_id" | "item_description">
    
export type Category = {
    id: number;
    description: string;
};
export type CreateCategoryInput = Omit<Category, "id">;
export type UpdateCategoryInput = Category;

export type UnitOfMeasure = {
    id: number;
    description: string;
};

export type CreateUnitOfMeasureInput = Omit<UnitOfMeasure, "id">;
export type UpdateUnitOfMeasureInput = UnitOfMeasure; 