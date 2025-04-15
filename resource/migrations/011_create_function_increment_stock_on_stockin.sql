CREATE OR REPLACE FUNCTION increment_stock_on_stockin()
RETURNS TRIGGER AS $$
DECLARE
    owner_id INTEGER;
BEGIN
    -- Get the owner from the parent stock_in entry
    SELECT owner_id INTO owner_id
    FROM tb_stock_in
    WHERE stock_in_id = NEW.stock_in_id;

    INSERT INTO tb_item_stock (item_id, owner_id, current_stock)
    VALUES (NEW.item_id, owner_id, NEW.quantity)
    ON CONFLICT (item_id, owner_id)
    DO UPDATE SET current_stock = tb_item_stock.current_stock + EXCLUDED.current_stock;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_stockin_insert
AFTER INSERT ON tb_stock_in_item
FOR EACH ROW
EXECUTE FUNCTION increment_stock_on_stockin();
