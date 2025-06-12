-- Create table only if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'tb_stock_waste'
      AND table_schema = current_schema()
  ) THEN
    CREATE TABLE tb_stock_waste (
        stock_waste_id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL,
        store_id INTEGER NOT NULL,
        wasted_quantity NUMERIC(10,2) NOT NULL CHECK (wasted_quantity > 0),
        reason_text TEXT NOT NULL,
        reason_image_url TEXT,
        created_by INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        
        CONSTRAINT fk_stock_waste_item FOREIGN KEY (item_id) REFERENCES tb_item(item_id),
        CONSTRAINT fk_stock_waste_store FOREIGN KEY (store_id) REFERENCES tb_store(store_id),
        CONSTRAINT fk_stock_waste_user FOREIGN KEY (created_by) REFERENCES public.tb_user(user_id)
    );
  END IF;
END
$$;

-- Create ENUM type if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
      FROM pg_type t
      JOIN pg_namespace n ON t.typnamespace = n.oid
     WHERE t.typname = 'stock_waste_status'
       AND n.nspname = current_schema()
  ) THEN
    CREATE TYPE stock_waste_status AS ENUM ('draft', 'finalized');
  END IF;
END
$$;

-- Add 'status' column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_stock_waste'
      AND column_name = 'status'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_stock_waste
    ADD COLUMN status stock_waste_status NOT NULL DEFAULT 'draft';
  END IF;
END
$$;

-- Add comment on 'status' column
COMMENT ON COLUMN tb_stock_waste.status IS
  'Stock-waste status: ''draft'' allows editing; ''finalized'' locks the record for audit and reporting.';

-- Add 'finalized_at' column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_stock_waste'
      AND column_name = 'finalized_at'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_stock_waste
    ADD COLUMN finalized_at TIMESTAMPTZ;
  END IF;
END
$$;

-- Add comment on 'finalized_at' column
COMMENT ON COLUMN tb_stock_waste.finalized_at IS
  'Timestamp of when this waste record was finalized.';
