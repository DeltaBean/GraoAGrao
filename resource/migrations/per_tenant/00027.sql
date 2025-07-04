-- Add 'label_pdf_url' column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item_packaging'
      AND column_name = 'label_pdf_url'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item_packaging
    ADD COLUMN label_pdf_url TEXT;
  END IF;
END
$$;

-- Add 'label_preview_url' column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item_packaging'
      AND column_name = 'label_preview_url'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item_packaging
    ADD COLUMN label_preview_url TEXT;
  END IF;
END
$$;

-- Add 'ean_8' column if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item_packaging'
      AND column_name = 'ean_8'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item_packaging
    ADD COLUMN ean_8 TEXT;
  END IF;
END
$$;
