-- +goose Up

-- Create table tb_stock_out if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'tb_stock_out'
      AND table_schema = current_schema()
  ) THEN
    CREATE TABLE tb_stock_out (
        stock_out_id SERIAL PRIMARY KEY,
        owner_id INTEGER NOT NULL REFERENCES public.tb_user(user_id),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  END IF;
END
$$;
