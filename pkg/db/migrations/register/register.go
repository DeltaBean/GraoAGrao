package register

import (
	"context"

	"github.com/jackc/pgx/v5"
)

type MigrationFunc func(ctx context.Context, tx pgx.Tx, schemaName string) error

var Migrations = map[string]MigrationFunc{}

func Register(name string, fn MigrationFunc) {
	Migrations[name] = fn
}
