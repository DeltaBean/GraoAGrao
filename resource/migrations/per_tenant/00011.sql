-- +goose Up

-- Create table tb_stock if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'tb_stock'
      AND table_schema = current_schema()
  ) THEN
    CREATE TABLE tb_stock (
        stock_id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL REFERENCES tb_item (item_id),
        created_by INTEGER NOT NULL REFERENCES public.tb_user (user_id),
        current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        CONSTRAINT uq_item_owner UNIQUE (item_id)
    );
  END IF;
END
$$;

-- Create trigger 'set_updated_at' on tb_stock if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_updated_at'
      AND tgrelid = 'tb_stock'::regclass
  ) THEN
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON tb_stock
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;
