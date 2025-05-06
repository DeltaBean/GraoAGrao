-- Step 1: Create the new table for packaging breakdown
CREATE TABLE public.tb_stock_in_packaging (
    stock_in_packaging_id SERIAL PRIMARY KEY,
    stock_in_item_id INTEGER NOT NULL REFERENCES public.tb_stock_in_item(stock_in_item_id) ON DELETE CASCADE,
    item_packaging_id INTEGER NOT NULL REFERENCES public.tb_item_packaging(item_packaging_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tb_stock_in_packaging
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Step 2: Adjust the stock-in trigger functions to use total_quantity instead of quantity
-- Update trigger function: adjust_stock_on_stockin_update
CREATE OR REPLACE FUNCTION public.adjust_stock_on_stockin_update()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    owner_id INTEGER;
    delta NUMERIC(10,2);
BEGIN
    SELECT owner_id INTO owner_id
    FROM tb_stock_in
    WHERE stock_in_id = NEW.stock_in_id;

    delta := NEW.total_quantity - OLD.total_quantity;

    UPDATE tb_item_stock
    SET current_stock = current_stock + delta
    WHERE item_id = NEW.item_id AND owner_id = owner_id;

    RETURN NEW;
END;
$function$;

-- Update trigger function: increment_stock_on_stockin
CREATE OR REPLACE FUNCTION public.increment_stock_on_stockin()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
DECLARE
    _owner_id INTEGER;
BEGIN
    SELECT si.owner_id INTO _owner_id
    FROM tb_stock_in si
    WHERE stock_in_id = NEW.stock_in_id;

    INSERT INTO tb_item_stock (item_id, owner_id, current_stock)
    VALUES (NEW.item_id, _owner_id, NEW.total_quantity)
    ON CONFLICT (item_id, owner_id)
    DO UPDATE SET current_stock = tb_item_stock.current_stock + EXCLUDED.current_stock;

    RETURN NEW;
END;
$function$;
