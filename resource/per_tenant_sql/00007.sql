-- +goose Up

CREATE TABLE IF NOT EXISTS tb_stock_out (
    stock_out_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES public.tb_user(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);