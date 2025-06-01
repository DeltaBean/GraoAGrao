-- +goose Up
CREATE TABLE IF NOT EXISTS public.tb_tenant_migration_log (
  schema_name TEXT,
  script_name TEXT,
  applied_at TIMESTAMP DEFAULT now(),
  PRIMARY KEY(schema_name, script_name)
);
