package model

import "time"

// TryOutJob represents a demo-environment provisioning request.
type TryOutJob struct {
	JobID        int          `json:"job_id"`      // SERIAL PRIMARY KEY
	TryoutUUID   string       `json:"tryout_uuid"` // UUID for this demo job
	CreatedBy    User         `json:"created_by"`
	Organization Organization `json:"organization"`
	Status       string       `json:"status"`     // pending | in_progress | created | failed | destroyed
	CreatedAt    time.Time    `json:"created_at"` // timestamp when job was created
}
