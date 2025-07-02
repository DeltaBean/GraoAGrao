-- +goose Up

-- Step 1: Add column 'is_fractionable' to tb_item if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item'
      AND column_name = 'is_fractionable'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item
    ADD COLUMN is_fractionable BOOLEAN;
  END IF;
END
$$;

-- Step 2: Update all existing rows to set 'is_fractionable' to true if it's null
UPDATE tb_item
SET is_fractionable = true
WHERE is_fractionable IS NULL;

-- Step 3: Set NOT NULL constraint if column is not already NOT NULL
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item'
      AND column_name = 'is_fractionable'
      AND is_nullable = 'YES'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item
    ALTER COLUMN is_fractionable SET NOT NULL;
  END IF;
END
$$;
