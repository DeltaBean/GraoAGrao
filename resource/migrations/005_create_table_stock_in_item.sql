CREATE TABLE IF NOT EXISTS tb_stock_in_item (
    stock_in_item_id SERIAL PRIMARY KEY,
    stock_in_id INTEGER NOT NULL REFERENCES tb_stock_in(stock_in_id),
    item_id INTEGER NOT NULL REFERENCES tb_item(item_id),
    buy_price NUMERIC(10, 2) NOT NULL,
    total_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON COLUMN public.tb_stock_in_item.total_quantity IS
  'The total quantity (in base units) that must match the sum of all associated packagings';
  