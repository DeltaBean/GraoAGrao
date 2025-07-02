-- +goose Up
-- Step 1: Add the new column
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_stock_in'
      AND column_name = 'finalized_at'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_stock_in
    ADD COLUMN finalized_at TIMESTAMPTZ;
  END IF;
END
$$;

-- Step 2: Set finalized_at = now() for all existing records
UPDATE tb_stock_in
SET finalized_at = now();

-- Step 3: Create trigger function
CREATE OR REPLACE FUNCTION set_finalized_at_on_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'finalized' AND OLD.status IS DISTINCT FROM 'finalized' THEN
        NEW.finalized_at := now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create the trigger
DROP TRIGGER IF EXISTS trg_set_finalized_at ON tb_stock_in;

CREATE TRIGGER trg_set_finalized_at
BEFORE UPDATE ON tb_stock_in
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION set_finalized_at_on_status_change();