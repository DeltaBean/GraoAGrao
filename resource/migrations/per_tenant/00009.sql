-- +goose Up

-- Create table tb_category if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'tb_category'
      AND table_schema = current_schema()
  ) THEN
    CREATE TABLE tb_category (
        category_id SERIAL PRIMARY KEY,
        category_description VARCHAR NOT NULL,
        owner_id INTEGER NOT NULL REFERENCES public.tb_user(user_id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END
$$;

-- Create trigger 'set_updated_at' on tb_category if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'set_updated_at'
      AND tgrelid = 'tb_category'::regclass
  ) THEN
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON tb_category
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  END IF;
END
$$;
