# ☕ Grão a Grão

Grão a Grão is a schema-per-tenant SaaS platform. This project uses [Goose](https://github.com/pressly/goose) for database migrations and supports both **public schema** migrations and **per-tenant** schema migrations.

---

## Running Migrations

### Migrate `public` schema (shared tables)

```bash
goose -dir ./resource/migrations/public postgres "$POSTGRES_DSN" up
```

### Migrate per-tenant schemas
```bash
/app/migrate_per_tenant
```

## Environment Variables
| Variable                  | Description                                         |
|---------------------------|-----------------------------------------------------|
| POSTGRES_DSN              | PostgreSQL DSN used by Goose and internal DB access |
| PER_TENANT_MIGRATION_PATH | Path to .sql scripts for per-tenant migrations      |
