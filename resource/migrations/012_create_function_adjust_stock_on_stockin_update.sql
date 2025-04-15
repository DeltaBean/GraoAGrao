CREATE OR REPLACE FUNCTION adjust_stock_on_stockin_update()
RETURNS TRIGGER AS $$
DECLARE
    owner_id INTEGER;
    delta INTEGER;
BEGIN
    -- Get the owner from the parent stock_in entry
    SELECT owner_id INTO owner_id
    FROM tb_stock_in
    WHERE stock_in_id = NEW.stock_in_id;

    -- Calculate the quantity difference
    delta := NEW.quantity - OLD.quantity;

    -- Update the stock accordingly
    UPDATE tb_item_stock
    SET current_stock = current_stock + delta
    WHERE item_id = NEW.item_id AND owner_id = owner_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stockin_update
AFTER UPDATE ON tb_stock_in_item
FOR EACH ROW
WHEN (OLD.quantity IS DISTINCT FROM NEW.quantity)
EXECUTE FUNCTION adjust_stock_on_stockin_update();
