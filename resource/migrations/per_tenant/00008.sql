-- +goose Up

-- Create table tb_stock_out_item if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'tb_stock_out_item'
      AND table_schema = current_schema()
  ) THEN
    CREATE TABLE tb_stock_out_item (
        stock_out_item_id SERIAL PRIMARY KEY,
        stock_out_id INTEGER NOT NULL REFERENCES tb_stock_out(stock_out_id),
        item_id INTEGER NOT NULL REFERENCES tb_item(item_id),
        quantity INTEGER NOT NULL CHECK (quantity > 0)
    );
  END IF;
END
$$;