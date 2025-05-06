-- Step 1: Create the ENUM type for status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'stock_in_status') THEN
        CREATE TYPE stock_in_status AS ENUM ('draft', 'finalized');
    END IF;
END$$;

-- Step 2: Add status column to tb_stock_in
ALTER TABLE public.tb_stock_in
ADD COLUMN status stock_in_status NOT NULL DEFAULT 'draft';

COMMENT ON COLUMN public.tb_stock_in.status IS
  'Stock-in status: ''draft'' allows editing; ''finalized'' triggers packaging consistency validation.';

-- Step 3: Create validation function
CREATE OR REPLACE FUNCTION validate_stock_in_packaging_totals()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
BEGIN
    -- Only validate if status is transitioning to 'finalized'
    IF NEW.status = 'finalized' AND OLD.status IS DISTINCT FROM 'finalized' THEN
        FOR rec IN
            SELECT sii.stock_in_item_id, sii.total_quantity,
                   SUM(sip.quantity * ip.quantity) AS calculated_total
            FROM tb_stock_in_item sii
            LEFT JOIN tb_stock_in_packaging sip ON sip.stock_in_item_id = sii.stock_in_item_id
            LEFT JOIN tb_item_packaging ip ON ip.item_packaging_id = sip.item_packaging_id
            WHERE sii.stock_in_id = NEW.stock_in_id
            GROUP BY sii.stock_in_item_id, sii.total_quantity
        LOOP
            IF rec.calculated_total IS NULL THEN
                RAISE EXCEPTION 'StockInItem % has no packaging rows', rec.stock_in_item_id;
            END IF;

            IF rec.total_quantity IS DISTINCT FROM rec.calculated_total THEN
                RAISE EXCEPTION 'StockInItem %: packaging total (%.2f) does not match declared total_quantity (%.2f)',
                    rec.stock_in_item_id, rec.calculated_total, rec.total_quantity;
            END IF;
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$;

-- Step 4: Create trigger on tb_stock_in
DROP TRIGGER IF EXISTS trg_validate_stock_in_on_finalize ON public.tb_stock_in;

CREATE TRIGGER trg_validate_stock_in_on_finalize
BEFORE UPDATE ON public.tb_stock_in
FOR EACH ROW
EXECUTE FUNCTION validate_stock_in_packaging_totals();
