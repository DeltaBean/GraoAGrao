-- +goose Up
-- Step 1: Create the tb_store table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'tb_store'
      AND table_schema = current_schema()
  ) THEN
    CREATE TABLE tb_store (
        store_id SERIAL PRIMARY KEY,
        store_name VARCHAR(255) NOT NULL,
        created_by INT NOT NULL REFERENCES public.tb_user(user_id),
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
    );
  END IF;
END
$$;

-- applying name capitalization for tb_store
CREATE OR REPLACE FUNCTION trg_capitalize_store_name()
RETURNS TRIGGER AS $$
BEGIN
    NEW.store_name := fn_capitalize_proper_noun(NEW.store_name);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


DROP TRIGGER IF EXISTS trg_capitalize_store_name ON tb_store;
CREATE TRIGGER trg_capitalize_store_name
BEFORE INSERT OR UPDATE ON tb_store
FOR EACH ROW
EXECUTE FUNCTION trg_capitalize_store_name();

-- Step 2: Update existing tables to add store_id and rename owner_id to created_by
-- +goose Up

-- tb_category: Rename 'owner_id' to 'created_by' and add 'store_id'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_category'
      AND column_name = 'owner_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_category RENAME COLUMN owner_id TO created_by;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_category'
      AND column_name = 'store_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_category
    ADD COLUMN store_id INT NOT NULL REFERENCES tb_store(store_id);
  END IF;
END
$$;

-- tb_stock_in: Rename 'owner_id' to 'created_by' and add 'store_id'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_stock_in'
      AND column_name = 'owner_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_stock_in RENAME COLUMN owner_id TO created_by;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_stock_in'
      AND column_name = 'store_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_stock_in
    ADD COLUMN store_id INT NOT NULL REFERENCES tb_store(store_id);
  END IF;
END
$$;

-- tb_stock_out: Rename 'owner_id' to 'created_by' and add 'store_id'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_stock_out'
      AND column_name = 'owner_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_stock_out RENAME COLUMN owner_id TO created_by;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_stock_out'
      AND column_name = 'store_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_stock_out
    ADD COLUMN store_id INT NOT NULL REFERENCES tb_store(store_id);
  END IF;
END
$$;

-- tb_unit_of_measure: Rename 'owner_id' to 'created_by' and add 'store_id'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_unit_of_measure'
      AND column_name = 'owner_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_unit_of_measure RENAME COLUMN owner_id TO created_by;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_unit_of_measure'
      AND column_name = 'store_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_unit_of_measure
    ADD COLUMN store_id INT NOT NULL REFERENCES tb_store(store_id);
  END IF;
END
$$;

-- tb_item: Rename 'owner_id' to 'created_by' and add 'store_id'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item'
      AND column_name = 'owner_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item RENAME COLUMN owner_id TO created_by;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item'
      AND column_name = 'store_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item
    ADD COLUMN store_id INT NOT NULL REFERENCES tb_store(store_id);
  END IF;
END
$$;

-- tb_item_packaging: Rename 'owner_id' to 'created_by' and add 'store_id'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item_packaging'
      AND column_name = 'owner_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item_packaging RENAME COLUMN owner_id TO created_by;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_item_packaging'
      AND column_name = 'store_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_item_packaging
    ADD COLUMN store_id INT NOT NULL REFERENCES tb_store(store_id);
  END IF;
END
$$;

-- tb_stock: Rename 'owner_id' to 'created_by' and add 'store_id'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_stock'
      AND column_name = 'owner_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_stock RENAME COLUMN owner_id TO created_by;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'tb_stock'
      AND column_name = 'store_id'
      AND table_schema = current_schema()
  ) THEN
    ALTER TABLE tb_stock
    ADD COLUMN store_id INT NOT NULL REFERENCES tb_store(store_id);
  END IF;
END
$$;


-- Step 3: Create the vw_stock_summary view
DROP VIEW IF EXISTS vw_stock_summary;

CREATE
OR REPLACE VIEW vw_stock_summary AS
SELECT
    s.stock_id,
    i.item_id,
    i.item_description,
    i.ean13,
    c.category_description,
    uom.unit_id,
    uom.unit_description AS unit_of_measure,
    i.is_fractionable,
    s.current_stock,
    s.created_at AS stock_created_at,
    s.updated_at AS stock_updated_at,
    st.store_id AS store_id,
    st.store_name AS store_name
FROM
   tb_stock AS s
    JOIN tb_item AS i ON i.item_id = s.item_id
    LEFT JOIN tb_category AS c ON c.category_id = i.category_id
    JOIN tb_unit_of_measure AS uom ON uom.unit_id = i.unit_id
    JOIN tb_store AS st ON st.store_id = s.store_id;