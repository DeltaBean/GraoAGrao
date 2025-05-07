package util

import "time"

// safeTime returns the dereferenced value of a *time.Time if it's non-nil.
// If the input is nil, it returns the zero value of time.Time instead.
// This is useful when working with nullable timestamps that must always
// be represented as a non-pointer time.Time in output structs.
func SafeTime(t *time.Time) time.Time {
	if t != nil {
		return *t
	}
	return time.Time{}
}
