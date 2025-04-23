package validator

import v10 "github.com/go-playground/validator/v10"

// Validate is a singleton thread safe instance you can use everywhere.
var Validate = v10.New()
