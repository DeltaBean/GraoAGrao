-- +goose Up
CREATE TABLE IF NOT EXISTS tb_item_packaging (
    item_packaging_id SERIAL PRIMARY KEY,
    item_id INTEGER NOT NULL REFERENCES tb_item (item_id),
    item_packaging_description TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    owner_id INTEGER NOT NULL REFERENCES public.tb_user (user_id),
    created_at TIMESTAMPTZ DEFAULT NOW (),
    updated_at TIMESTAMPTZ DEFAULT NOW ()
);