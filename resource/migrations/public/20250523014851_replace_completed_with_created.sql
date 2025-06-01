-- +goose Up
-- +goose StatementBegin
-- Step 1: Update data from 'completed' to 'created'
UPDATE public.tb_tryout_job
SET status = 'created'
WHERE status = 'completed';
-- +goose StatementEnd

-- +goose StatementBegin
-- Step 2: Replace ENUM type

-- 2.1 Drop default temporarily
ALTER TABLE public.tb_tryout_job
ALTER COLUMN status DROP DEFAULT;

-- 2.2 Rename old type
ALTER TYPE tryout_job_status RENAME TO tryout_job_status_old;

-- 2.3 Create new type without 'completed'
CREATE TYPE tryout_job_status AS ENUM ('pending', 'in_progress', 'created', 'failed', 'destroyed');

-- 2.4 Alter column to use new type
ALTER TABLE public.tb_tryout_job
ALTER COLUMN status TYPE tryout_job_status
USING status::text::tryout_job_status;

-- 2.5 Set default back
ALTER TABLE public.tb_tryout_job
ALTER COLUMN status SET DEFAULT 'pending';

-- 2.6 Drop old type
DROP TYPE tryout_job_status_old;
-- +goose StatementEnd

-- +goose StatementBegin
ALTER TABLE public.tb_tryout_job
DROP COLUMN expires_at;

ALTER TABLE public.tb_organization
ADD COLUMN expires_at timestamptz DEFAULT NULL,
ADD COLUMN is_try_out boolean NOT NULL DEFAULT false;

ALTER TABLE public.tb_organization
ADD CONSTRAINT chk_try_out_requires_expiration
CHECK (
    (
    (is_try_out = false OR expires_at IS NOT NULL)
    AND
    (expires_at IS NULL OR is_try_out = true)
    )
);

-- +goose StatementEnd