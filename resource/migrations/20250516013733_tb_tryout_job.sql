-- +goose Up
-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type
        WHERE typname = 'tryout_job_status'
    ) THEN
        CREATE TYPE tryout_job_status AS ENUM (
            'pending', 'in_progress', 'completed', 'failed'
        );
    END IF;
END
$$;
-- +goose StatementEnd

CREATE TABLE IF NOT EXISTS public.tb_tryout_job (
  job_id SERIAL PRIMARY KEY,
  tryout_uuid VARCHAR(36) UNIQUE NOT NULL,
  created_by INT NOT NULL REFERENCES public.tb_user(user_id),
  organization_id INT NOT NULL REFERENCES public.tb_organization(organization_id),
  status tryout_job_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

ALTER TABLE public.tb_user
  DROP CONSTRAINT IF EXISTS tb_user_username_key;
  
DROP INDEX IF EXISTS tb_user_username_key;
