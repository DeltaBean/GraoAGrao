-- +goose Up

-- Create table tb_item if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'tb_item'
      AND table_schema = current_schema()
  ) THEN
    CREATE TABLE tb_item (
        item_id SERIAL PRIMARY KEY,
        item_description TEXT NOT NULL,
        ean13 CHAR(13) NOT NULL,
        category TEXT NOT NULL,

        owner_id INTEGER NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),

        CONSTRAINT fk_owner FOREIGN KEY (owner_id) REFERENCES public.tb_user(user_id)
    );
  END IF;
END
$$;

-- Create trigger 'set_updated_at' on tb_item if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_updated_at'
      AND tgrelid = 'tb_item'::regclass
  ) THEN
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON tb_item
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;
