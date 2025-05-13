-- +goose Up
-- Step 1: Rename quantity to total_quantity in tb_stock_out_item
ALTER TABLE tb_stock_out_item
RENAME COLUMN quantity TO total_quantity;

-- Step 2: Create tb_stock_out_packaging table
CREATE TABLE tb_stock_out_packaging (
    stock_out_packaging_id SERIAL PRIMARY KEY,
    stock_out_item_id INT NOT NULL REFERENCES tb_stock_out_item(stock_out_item_id) ON DELETE CASCADE,
    item_packaging_id INT NOT NULL REFERENCES tb_item_packaging(item_packaging_id),
    quantity INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add update timestamp trigger
CREATE TRIGGER trg_set_updated_at_stock_out_packaging
BEFORE UPDATE ON tb_stock_out_packaging
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 3: Add status and finalized_at to tb_stock_out
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_out_status') THEN
        CREATE TYPE stock_out_status AS ENUM ('draft', 'finalized');
    END IF;
END$$;
ALTER TABLE tb_stock_out
ADD COLUMN status stock_out_status DEFAULT 'draft'::stock_out_status NOT NULL,
ADD COLUMN finalized_at TIMESTAMPTZ NULL;
COMMENT ON COLUMN tb_stock_out.status IS 'Stock-out status: ''draft'' allows editing; ''finalized'' triggers packaging consistency validation.';

-- Step 4: Trigger to set finalized_at on status change
CREATE TRIGGER trg_set_finalized_at_stock_out
BEFORE UPDATE ON tb_stock_out
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION set_finalized_at_on_status_change();

-- Step 5: Packaging validation function for stock out
CREATE OR REPLACE FUNCTION validate_stock_out_packaging_totals()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
BEGIN
  IF (
    NEW.status = 'finalized'
    AND OLD.status IS DISTINCT FROM 'finalized'
  ) THEN
    FOR rec IN
      SELECT
        i.is_fractionable,
        soi.stock_out_item_id,
        soi.total_quantity,
        SUM(sop.quantity * ip.quantity) AS calculated_total
      FROM tb_stock_out_item AS soi
      JOIN tb_item AS i ON i.item_id = soi.item_id
      LEFT JOIN tb_stock_out_packaging AS sop ON sop.stock_out_item_id = soi.stock_out_item_id
      LEFT JOIN tb_item_packaging AS ip ON ip.item_packaging_id = sop.item_packaging_id
      WHERE soi.stock_out_id = NEW.stock_out_id
      GROUP BY i.is_fractionable, soi.stock_out_item_id, soi.total_quantity
    LOOP
      IF rec.is_fractionable THEN
        IF rec.calculated_total IS NULL THEN
          RAISE EXCEPTION USING
            ERRCODE = 'P0004',
            MESSAGE = FORMAT('StockOutItem %s has no packaging rows', rec.stock_out_item_id);
        ELSIF rec.total_quantity IS DISTINCT FROM rec.calculated_total THEN
          RAISE EXCEPTION USING
            ERRCODE = 'P0005',
            MESSAGE = FORMAT(
              'StockOutItem %s: packaging total (%s) does not match declared total_quantity (%s)',
              rec.stock_out_item_id,
              rec.calculated_total::text,
              rec.total_quantity::text
            );
        END IF;
      END IF;
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create validation trigger on tb_stock_out
CREATE TRIGGER trg_validate_stock_out_on_finalize
BEFORE UPDATE ON tb_stock_out
FOR EACH ROW
EXECUTE FUNCTION validate_stock_out_packaging_totals();

-- Step 7: Function to subtract stock on stock_out finalization
CREATE OR REPLACE FUNCTION fn_update_stock_on_stock_out_finalization()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run if finalized_at transitioned from NULL to NOT NULL
  -- AND status changed from 'draft' to 'finalized'
  IF (
    OLD.finalized_at IS NULL AND NEW.finalized_at IS NOT NULL AND
    OLD.status = 'draft' AND NEW.status = 'finalized'
  ) THEN
    INSERT INTO tb_stock (item_id, current_stock, owner_id)
    SELECT soi.item_id, -1 * soi.total_quantity, so.owner_id
    FROM tb_stock_out_item soi
    JOIN tb_stock_out so ON so.stock_out_id = soi.stock_out_id
    WHERE soi.stock_out_id = NEW.stock_out_id
    ON CONFLICT (item_id)
    DO UPDATE SET current_stock = tb_stock.current_stock + EXCLUDED.current_stock;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 8: Create trigger for stock_out finalization
DROP TRIGGER IF EXISTS trg_update_stock_on_out_finalization ON tb_stock_out;

CREATE TRIGGER trg_update_stock_on_out_finalization
AFTER UPDATE ON tb_stock_out
FOR EACH ROW
WHEN (
  OLD.finalized_at IS DISTINCT FROM NEW.finalized_at OR
  OLD.status IS DISTINCT FROM NEW.status
)
EXECUTE FUNCTION fn_update_stock_on_stock_out_finalization();