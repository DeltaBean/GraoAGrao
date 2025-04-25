package response

type GenericPostgreSQLErrorResponse struct {
	Error   string `json:"error"`
	Code    string `json:"code"`
	Details string `json:"details"`
}

type ForeignKeyDeleteReferencedErrorResponse struct {
	Error               string `json:"error"`
	Code                string `json:"code"`
	Details             string `json:"details"`
	ReferencedTable     string `json:"referencedTable"`
	ReferencingEntities any    `json:"referencingEntities"`
}

type ForeignKeyReferenceMissingErrorResponse struct {
	Error           string `json:"error"`
	Code            string `json:"code"`
	Details         string `json:"details"`
	ReferencedTable string `json:"referencedTable"`
}
