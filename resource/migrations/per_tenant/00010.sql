-- +goose Up

-- Step 1: Drop the 'category' column if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item'
      AND column_name = 'category'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item
    DROP COLUMN category;
  END IF;
END
$$;

-- Step 2: Add 'category_id' column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item'
      AND column_name = 'category_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item
    ADD COLUMN category_id INTEGER;
  END IF;
END
$$;

-- Step 3: Add foreign key constraint to tb_category if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
     AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_name = 'tb_item'
      AND tc.constraint_name = 'fk_category'
      AND tc.table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item
    ADD CONSTRAINT fk_category
    FOREIGN KEY (category_id)
    REFERENCES tb_category(category_id);
  END IF;
END
$$;
