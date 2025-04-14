CREATE TABLE IF NOT EXISTS tb_stock_in (
    stock_in_id SERIAL PRIMARY KEY,
    owner_id INTEGER NOT NULL REFERENCES tb_user(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);