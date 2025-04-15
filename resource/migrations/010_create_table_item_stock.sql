CREATE TABLE
    tb_item_stock (
        item_stock_id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL REFERENCES tb_item (item_id),
        owner_id INTEGER NOT NULL REFERENCES tb_user (user_id),
        current_stock INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW (),
        updated_at TIMESTAMPTZ DEFAULT NOW (),
        CONSTRAINT uq_item_owner UNIQUE (item_id, owner_id)
    );

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tb_item_stock
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();