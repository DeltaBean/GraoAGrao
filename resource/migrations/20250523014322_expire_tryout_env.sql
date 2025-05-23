-- +goose Up

-- +goose StatementBegin
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumlabel = 'create'
        AND enumtypid = 'tryout_job_status'::regtype
    ) THEN
        ALTER TYPE tryout_job_status ADD VALUE 'create';
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