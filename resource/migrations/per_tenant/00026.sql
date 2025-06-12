DROP TRIGGER IF EXISTS trg_set_finalized_at_stock_waste ON tb_stock_waste;

CREATE TRIGGER trg_set_finalized_at_stock_waste
BEFORE UPDATE ON tb_stock_waste
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION set_finalized_at_on_status_change();

CREATE OR REPLACE FUNCTION fn_update_stock_on_stock_waste_finalization()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run if finalized_at transitioned from NULL to NOT NULL
  -- AND status changed from 'draft' to 'finalized'
  IF (
    OLD.finalized_at IS NULL AND NEW.finalized_at IS NOT NULL AND
    OLD.status = 'draft' AND NEW.status = 'finalized'
  ) THEN
    INSERT INTO tb_stock (item_id, current_stock, store_id, created_by)
    SELECT
      sw.item_id,
      -1 * sw.wasted_quantity,
      sw.store_id,
      sw.created_by
    FROM tb_stock_waste sw
    JOIN tb_item i ON i.item_id = sw.item_id
    WHERE sw.stock_waste_id = NEW.stock_waste_id
    ON CONFLICT (item_id)
    DO UPDATE SET current_stock = tb_stock.current_stock + EXCLUDED.current_stock;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_stock_on_waste_finalization ON tb_stock_waste;

CREATE TRIGGER trg_update_stock_on_waste_finalization
AFTER UPDATE ON tb_stock_waste
FOR EACH ROW
WHEN (
  OLD.finalized_at IS DISTINCT FROM NEW.finalized_at OR
  OLD.status IS DISTINCT FROM NEW.status
)
EXECUTE FUNCTION fn_update_stock_on_stock_waste_finalization();
