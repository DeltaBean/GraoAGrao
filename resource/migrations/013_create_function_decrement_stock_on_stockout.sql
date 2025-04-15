CREATE OR REPLACE FUNCTION decrement_stock_on_stockout()
RETURNS TRIGGER AS $$
DECLARE
    owner_id INTEGER;
BEGIN
    -- Get the owner from the parent stock_out entry
    SELECT owner_id INTO owner_id
    FROM tb_stock_out
    WHERE stock_out_id = NEW.stock_out_id;

    -- Subtract quantity from the item_stock
    UPDATE tb_item_stock
    SET current_stock = current_stock - NEW.quantity
    WHERE item_id = NEW.item_id AND owner_id = owner_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stockout_insert
AFTER INSERT ON tb_stock_out_item
FOR EACH ROW
EXECUTE FUNCTION decrement_stock_on_stockout();