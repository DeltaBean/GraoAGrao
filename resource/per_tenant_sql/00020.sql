-- +goose Up
ALTER TABLE tb_stock
ADD CONSTRAINT unique_item_id UNIQUE (item_id);

CREATE OR REPLACE FUNCTION fn_update_stock_on_stock_in_finalization()
RETURNS TRIGGER AS $$
BEGIN
  -- Run only if finalized_at transitioned from NULL to NOT NULL
  -- AND status changed from 'draft' to 'finalized'
  IF (
    OLD.finalized_at IS NULL AND NEW.finalized_at IS NOT NULL AND
    OLD.status = 'draft' AND NEW.status = 'finalized'
  ) THEN
    INSERT INTO tb_stock (item_id, current_stock, owner_id)
    SELECT sii.item_id, sii.total_quantity, si.owner_id
    FROM tb_stock_in_item sii
    JOIN tb_stock_in si ON si.stock_in_id = sii.stock_in_id
    WHERE sii.stock_in_id = NEW.stock_in_id
    ON CONFLICT (item_id)
    DO UPDATE SET current_stock = tb_stock.current_stock + EXCLUDED.current_stock;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_stock_on_finalization ON tb_stock_in;

CREATE TRIGGER trg_update_stock_on_finalization
AFTER UPDATE ON tb_stock_in
FOR EACH ROW
WHEN (
  OLD.finalized_at IS DISTINCT FROM NEW.finalized_at OR
  OLD.status IS DISTINCT FROM NEW.status
)
EXECUTE FUNCTION fn_update_stock_on_stock_in_finalization();
