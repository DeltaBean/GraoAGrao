-- +goose Up
CREATE TABLE tb_stock_in_packaging (
    stock_in_packaging_id SERIAL PRIMARY KEY,
    stock_in_item_id INTEGER NOT NULL REFERENCES tb_stock_in_item(stock_in_item_id) ON DELETE CASCADE,
    item_packaging_id INTEGER NOT NULL REFERENCES tb_item_packaging(item_packaging_id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tb_stock_in_packaging
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();