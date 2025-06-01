package model

import "time"

type TenantMigrationLog struct {
	SchemaName string
	ScriptName string
	AppliedAt  time.Time
}
