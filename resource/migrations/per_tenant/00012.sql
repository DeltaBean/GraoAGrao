-- +goose Up

-- Step 1: Create the tb_unit_of_measure table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_name = 'tb_unit_of_measure'
      AND table_schema = current_schema()
  ) THEN
    CREATE TABLE tb_unit_of_measure (
        unit_id SERIAL PRIMARY KEY,
        unit_description TEXT NOT NULL,
        owner_id INTEGER NOT NULL REFERENCES public.tb_user(user_id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END
$$;

-- Step 2: Add unit_id column to tb_item if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item'
      AND column_name = 'unit_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item
    ADD COLUMN unit_id INTEGER;
  END IF;
END
$$;

-- Step 3: Set unit_id column as NOT NULL if it's currently nullable
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item'
      AND column_name = 'unit_id'
      AND is_nullable = 'YES'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item
    ALTER COLUMN unit_id SET NOT NULL;
  END IF;
END
$$;

-- Step 4: Add foreign key constraint if it doesn't already exist
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
      AND tc.constraint_name = 'fk_item_unit'
      AND tc.table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item
    ADD CONSTRAINT fk_item_unit
    FOREIGN KEY (unit_id) REFERENCES tb_unit_of_measure(unit_id);
  END IF;
END
$$;
