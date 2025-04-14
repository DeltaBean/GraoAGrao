CREATE TABLE IF NOT EXISTS tb_item (
    item_id SERIAL PRIMARY KEY,
    item_description TEXT NOT NULL,
    ean13 CHAR(13) NOT NULL,
    category TEXT NOT NULL,
    
    owner_id INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES tb_user(user_id)
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tb_item
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
