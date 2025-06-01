-- +goose Up

-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'created'
        AND enumtypid = 'tryout_job_status'::regtype
    ) THEN
        ALTER TYPE tryout_job_status ADD VALUE 'created';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'destroyed'
        AND enumtypid = 'tryout_job_status'::regtype
    ) THEN
        ALTER TYPE tryout_job_status ADD VALUE 'destroyed';
    END IF;
END$$;
-- +goose StatementEnd

ALTER TABLE tb_organization
    ADD COLUMN is_active BOOLEAN DEFAULT TRUE;