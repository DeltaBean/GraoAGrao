CREATE TABLE IF NOT EXISTS tb_stock_in_item (
    stock_in_item_id SERIAL PRIMARY KEY,
    stock_in_id INTEGER NOT NULL REFERENCES tb_stock_in(stock_in_id),
    item_packaging_id INTEGER NOT NULL REFERENCES tb_item_packaging(item_packaging_id),
    buy_price NUMERIC(10, 2) NOT NULL,
    quantity INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);