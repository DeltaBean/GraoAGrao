-- +goose Up
CREATE TABLE
    tb_stock (
        stock_id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL REFERENCES tb_item (item_id),
        owner_id INTEGER NOT NULL REFERENCES public.tb_user (user_id),
        current_stock NUMERIC(10,2) NOT NULL DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW (),
        updated_at TIMESTAMPTZ DEFAULT NOW (),
        CONSTRAINT uq_item_owner UNIQUE (item_id, owner_id)
    );

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tb_stock
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();