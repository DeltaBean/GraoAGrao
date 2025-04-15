CREATE OR REPLACE FUNCTION adjust_stock_on_stockout_update()
RETURNS TRIGGER AS $$
DECLARE
    owner_id INTEGER;
    delta INTEGER;
BEGIN
    -- Get the owner from the parent stock_out entry
    SELECT owner_id INTO owner_id
    FROM tb_stock_out
    WHERE stock_out_id = NEW.stock_out_id;

    -- Calculate the quantity difference
    delta := OLD.quantity - NEW.quantity;

    -- Adjust the stock accordingly (reversing the original and applying the new)
    UPDATE tb_item_stock
    SET current_stock = current_stock + delta
    WHERE item_id = NEW.item_id AND owner_id = owner_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stockout_update
AFTER UPDATE ON tb_stock_out_item
FOR EACH ROW
WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
EXECUTE FUNCTION adjust_stock_on_stockout_update();
