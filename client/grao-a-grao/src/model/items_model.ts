export type Item = {
    item_id: number;
    item_description: string;
    ean13: string;
    category: Category;
    owner_id: number;
    created_at: string;
    updated_at: string;
};

export type Category = {
    id: number;
    description: string;
    owner_id: number;
    created_at: string;
    updated_at: string;
};

export type CreateItemInput =
    Omit<Item,
        "item_id" |
        "owner_id" |
        "created_at" |
        "updated_at" |
        "category">
    & {
        category: Pick<Category, "id" | "description">;
    };