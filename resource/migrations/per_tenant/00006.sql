-- +goose Up

-- Create table tb_stock_in_item if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'tb_stock_in_item'
      AND table_schema = current_schema()
  ) THEN
    CREATE TABLE tb_stock_in_item (
        stock_in_item_id SERIAL PRIMARY KEY,
        stock_in_id INTEGER NOT NULL REFERENCES tb_stock_in(stock_in_id),
        item_id INTEGER NOT NULL REFERENCES tb_item(item_id),
        buy_price NUMERIC(10, 2) NOT NULL,
        total_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END
$$;

-- Add comment to total_quantity column (safe even if column already exists)
COMMENT ON COLUMN tb_stock_in_item.total_quantity IS
  'The total quantity (in base units) that must match the sum of all associated packagings';

-- Create trigger 'set_updated_at' on tb_stock_in_item if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_updated_at'
      AND tgrelid = 'tb_stock_in_item'::regclass
  ) THEN
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON tb_stock_in_item
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;
