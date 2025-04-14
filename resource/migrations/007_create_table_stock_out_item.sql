CREATE TABLE IF NOT EXISTS tb_stock_out_item (
    stock_out_item_id SERIAL PRIMARY KEY,
    stock_out_id INTEGER NOT NULL REFERENCES tb_stock_out(stock_out_id),
    item_id INTEGER NOT NULL REFERENCES tb_item(item_id),
    buy_price NUMERIC(10,2) NOT NULL,
    quantity INTEGER NOT NULL
);