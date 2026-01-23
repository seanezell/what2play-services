variable "StatusCode" {
    description = "Status code for resource"
    type        = string
    default     = "200"
}

variable "APIResponseModels" {
    description = "Response model for method"
    type        = map(any)
    default     = { "application/json" = "Empty" }
}

variable "APIIntegrationAllowedOrigin" {
    description = "Allowed origin for Access-Control-Allow-Origin header."
    type        = string
    default     = "'*'"
}

variable "APIIntegrationResponseTemplates" {
    description = "Response templates for method"
    type        = map(any)
    default     = { "application/json" = "" }
}

variable "APIParentID" {
    description = "Rest API ID"
    type        = string
}

variable "APIResourceID" {
    description = "API Resource ID"
    type        = string
}

variable "APIHTTPMethod" {
    description = "API Response HTTP Method"
    type        = string
}

variable "SelectionPattern" {
    description = "Response Regex for pattern matching the response mapping"
    type        = string
    default     = ""
}