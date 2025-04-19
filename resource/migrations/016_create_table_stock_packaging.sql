CREATE TABLE
    IF NOT EXISTS tb_stock_packaging (
        stock_packaging_id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL REFERENCES tb_item (item_id),
        stock_packaging_description TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        owner_id INTEGER NOT NULL REFERENCES tb_user (user_id),
        created_at TIMESTAMPTZ DEFAULT NOW (),
        updated_at TIMESTAMPTZ DEFAULT NOW ()
    );
