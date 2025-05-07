-- Step 1: Add the new column
ALTER TABLE public.tb_stock_in
ADD COLUMN finalized_at TIMESTAMPTZ;

-- Step 2: Set finalized_at = now() for all existing records
UPDATE public.tb_stock_in
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
CREATE TRIGGER trg_set_finalized_at
BEFORE UPDATE ON public.tb_stock_in
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION set_finalized_at_on_status_change();