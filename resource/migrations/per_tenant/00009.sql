-- +goose Up

CREATE TABLE IF NOT EXISTS tb_category (
    category_id SERIAL PRIMARY KEY,
    category_description VARCHAR NOT NULL,
    owner_id INTEGER NOT NULL REFERENCES public.tb_user(user_id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON tb_category
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
