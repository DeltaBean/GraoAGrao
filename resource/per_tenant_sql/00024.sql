-- +goose Up

DROP VIEW IF EXISTS vw_stock_summary;
CREATE OR REPLACE VIEW vw_stock_summary
AS SELECT s.stock_id,
    i.item_id,
    i.item_description,
    i.ean13,
    c.category_description,
    c.category_id,
    uom.unit_id,
    uom.unit_description,
    i.is_fractionable,
    s.current_stock,
    s.created_at AS stock_created_at,
    s.updated_at AS stock_updated_at,
    s.created_by,
    st.store_id,
    st.store_name
   FROM tb_stock s
     JOIN tb_item i ON i.item_id = s.item_id
     LEFT JOIN tb_category c ON c.category_id = i.category_id
     JOIN tb_unit_of_measure uom ON uom.unit_id = i.unit_id
     JOIN tb_store st ON st.store_id = s.store_id;


CREATE OR REPLACE FUNCTION fn_update_stock_on_stock_in_finalization()
RETURNS TRIGGER AS $$
BEGIN
  -- Run only if finalized_at transitioned from NULL to NOT NULL
  -- AND status changed from 'draft' to 'finalized'
  IF (
    OLD.finalized_at IS NULL AND NEW.finalized_at IS NOT NULL AND
    OLD.status = 'draft' AND NEW.status = 'finalized'
  ) THEN
    INSERT INTO tb_stock (item_id, current_stock, store_id, created_by)
    SELECT sii.item_id, sii.total_quantity, si.store_id, si.created_by
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

CREATE OR REPLACE FUNCTION fn_update_stock_on_stock_out_finalization()
RETURNS TRIGGER AS $$
BEGIN
  -- Only run if finalized_at transitioned from NULL to NOT NULL
  -- AND status changed from 'draft' to 'finalized'
  IF (
    OLD.finalized_at IS NULL AND NEW.finalized_at IS NOT NULL AND
    OLD.status = 'draft' AND NEW.status = 'finalized'
  ) THEN
    INSERT INTO tb_stock (item_id, current_stock, store_id, created_by)
    SELECT soi.item_id, -1 * soi.total_quantity, so.store_id, so.created_by
    FROM tb_stock_out_item soi
    JOIN tb_stock_out so ON so.stock_out_id = soi.stock_out_id
    WHERE soi.stock_out_id = NEW.stock_out_id
    ON CONFLICT (item_id)
    DO UPDATE SET current_stock = tb_stock.current_stock + EXCLUDED.current_stock;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_stock_on_out_finalization ON tb_stock_out;

CREATE TRIGGER trg_update_stock_on_out_finalization
AFTER UPDATE ON tb_stock_out
FOR EACH ROW
WHEN (
  OLD.finalized_at IS DISTINCT FROM NEW.finalized_at OR
  OLD.status IS DISTINCT FROM NEW.status
)
EXECUTE FUNCTION fn_update_stock_on_stock_out_finalization();

