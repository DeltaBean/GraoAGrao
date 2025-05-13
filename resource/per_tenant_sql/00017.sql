-- +goose Up
-- Step 1: Create the ENUM type for status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_in_status') THEN
        CREATE TYPE stock_in_status AS ENUM ('draft', 'finalized');
    END IF;
END$$;

-- Step 2: Add status column to tb_stock_in
ALTER TABLE tb_stock_in
ADD COLUMN status stock_in_status NOT NULL DEFAULT 'draft';

COMMENT ON COLUMN tb_stock_in.status IS
  'Stock-in status: ''draft'' allows editing; ''finalized'' triggers packaging consistency validation.';

-- Step 3: Create validation function
CREATE OR REPLACE FUNCTION validate_stock_in_packaging_totals()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
BEGIN
    IF (
      NEW.status = 'finalized'
      AND OLD.status IS DISTINCT FROM 'finalized'
    )
    THEN
        FOR rec IN
            SELECT
              i.is_fractionable,
              sii.stock_in_item_id,
              sii.total_quantity,
              SUM(sip.quantity * ip.quantity) AS calculated_total
            FROM tb_stock_in_item    AS sii
            JOIN tb_item AS i
              ON i.item_id = sii.item_id
            LEFT JOIN tb_stock_in_packaging AS sip
              ON sip.stock_in_item_id = sii.stock_in_item_id
            LEFT JOIN tb_item_packaging     AS ip
              ON ip.item_packaging_id = sip.item_packaging_id
            WHERE sii.stock_in_id = NEW.stock_in_id
            GROUP BY i.is_fractionable, sii.stock_in_item_id, sii.total_quantity
        LOOP
            IF rec.is_fractionable THEN
              IF rec.calculated_total IS NULL THEN
                  RAISE EXCEPTION USING
                    ERRCODE = 'P0002',
                    MESSAGE = FORMAT(
                      'StockInItem %s has no packaging rows',
                      rec.stock_in_item_id
                    );
              ELSIF rec.total_quantity IS DISTINCT FROM rec.calculated_total THEN
                  RAISE EXCEPTION USING
                    ERRCODE = 'P0003',
                    MESSAGE = FORMAT(
                      'StockInItem %s: packaging total (%s) does not match declared total_quantity (%s)',
                      rec.stock_in_item_id,
                      rec.calculated_total::text,
                      rec.total_quantity::text
                    );
              END IF;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$;

-- Step 4: Create trigger on tb_stock_in
DROP TRIGGER IF EXISTS trg_validate_stock_in_on_finalize ON tb_stock_in;

CREATE TRIGGER trg_validate_stock_in_on_finalize
BEFORE UPDATE ON tb_stock_in
FOR EACH ROW
EXECUTE FUNCTION validate_stock_in_packaging_totals();
