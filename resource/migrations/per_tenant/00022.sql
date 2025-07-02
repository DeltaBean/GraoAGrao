-- +goose Up
DROP VIEW IF EXISTS vw_stock_summary;

CREATE OR REPLACE VIEW vw_stock_summary AS
SELECT
  s.stock_id,
  s.created_by,
  u.username           AS owner_username,
  u.email              AS owner_email,
  i.item_id,
  i.item_description,
  i.ean13,
  c.category_description,
  uom.unit_id,
  uom.unit_description AS unit_of_measure,
  i.is_fractionable,
  s.current_stock,
  s.created_at         AS stock_created_at,
  s.updated_at         AS stock_updated_at
FROM tb_stock AS s
JOIN tb_item AS i
  ON i.item_id = s.item_id
LEFT JOIN tb_category AS c
  ON c.category_id = i.category_id
JOIN tb_unit_of_measure AS uom
  ON uom.unit_id = i.unit_id
JOIN public.tb_user AS u
  ON u.user_id = s.created_by;
