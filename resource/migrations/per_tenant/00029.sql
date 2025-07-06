-- Add UNIQUE constraint 'unique_ean13' to 'ean13' column in tb_item if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_name = 'tb_item'
      AND tc.constraint_name = 'unique_ean13'
      AND tc.table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item
    ADD CONSTRAINT unique_ean13 UNIQUE (ean13);
  END IF;
END
$$;

-- Add UNIQUE constraint 'unique_ean8' to 'ean_8' column in tb_item_packaging if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_type = 'UNIQUE'
      AND tc.table_name = 'tb_item_packaging'
      AND tc.constraint_name = 'unique_ean8'
      AND tc.table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item_packaging
    ADD CONSTRAINT unique_ean8 UNIQUE (ean_8);
  END IF;
END
$$;