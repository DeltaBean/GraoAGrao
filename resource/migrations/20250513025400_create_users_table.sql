-- +goose Up
-- Create public tables and dev schema

CREATE TABLE public.tb_organization (
  organization_id SERIAL PRIMARY KEY,
  organization_name TEXT NOT NULL,
  organization_key TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL,
  schema_name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS public.tb_user (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(100) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  salt TEXT,
  google_id VARCHAR(100),
  given_name VARCHAR(255),
  family_name VARCHAR(255),
  picture_url TEXT,
  auth_provider VARCHAR(50) NOT NULL DEFAULT 'local',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  organization_id INT NOT NULL,
  CONSTRAINT unique_provider_id UNIQUE (auth_provider, google_id)
);

ALTER TABLE public.tb_user
  ADD CONSTRAINT fk_organization_id
  FOREIGN KEY (organization_id) REFERENCES public.tb_organization (organization_id);

CREATE SCHEMA dev;

INSERT INTO public.tb_organization (organization_name, organization_key, domain, schema_name)
VALUES ('Internal Development Organization', 'dev', 'dev', 'dev');

-- +goose Down
DROP TABLE IF EXISTS public.tb_user;
DROP TABLE IF EXISTS public.tb_organization;
DROP SCHEMA IF EXISTS dev CASCADE;
