variable "APIResourceID" {
    description = "API resource id"
    type        = string
}

variable "APIParentID" {
    description = "API root resource id"
    type        = string
}

variable "APIPathPart" {
    description = "API path for the resource"
    type        = string
}

variable "APIHTTPMethod" {
    description = "HTTP method for the resource"
    type        = string
    default     = "POST"
}

variable "APIMethodAuth" {
    description = "Authorization model for the resource"
    type        = string
    default     = "COGNITO_USER_POOLS"
}

variable "APIRequestModels" {
    description = "Request model for the resource"
    type        = map(any)
    default     = { "application/json" = "Empty" }
}

variable "APIIntegrationHTTPMethod" {
    description = "HTTP method for the integration"
    type        = string
    default     = "POST"
}

variable "APIIntegrationType" {
    description = "API integration type. Options are HTTP, MOCK, AWS, AWS_PROXY, HTTP_PROXY"
    type        = string
    default     = "AWS"
}

variable "APIIntegrationURI" {
    description = "URL for the resource"
    type        = string
}

variable "APIIntegrationRole" {
    description = "Role ARN for the resource"
    type        = string
}

variable "APIRequestTemplates" {
    description = "Request template for the resource"
    type        = map(any)
    default     = { "application/json" = "Empty" }
}

variable "APIResponseTemplates" {
    description = "Response template for the resource"
    type        = map(any)
    default     = { "application/json" = "Empty" }
}

variable "APIPassthroughBehavior" {
    description = "Passthrough behavior for the resource. Options are WHEN_NO_MATCH, WHEN_NO_TEMPLATES, NEVER"
    type        = string
    default     = "NEVER"
}

variable "DependsOn" {
    default = []
    type    = list(any)
}

variable "StatusCode" {
    description = "Status code for resource"
    type        = string
    default     = "200"
}

variable "APIIntegrationAllowedOrigin" {
    description = "Allowed origin for Access-Control-Allow-Origin header."
    type        = string
    default     = "'*'"
}

variable "APIMethodRequestParameters" {
    description = "list of request parameters"
    type        = map(any)
    default     = {}
}

variable "APIIntegrationRequestParameters" {
    description = "list of request parameters"
    type        = map(any)
    default     = {}
}

variable "APIMethodResponseResponseModels" {
    description = "Response model for the resource"
    type        = map(any)
    default     = {}
}

variable "APICacheKeyParams" {
    description = "Cache key parameters"
    type        = list(any)
    default     = []
}

variable "APIResponseModels" {
    type        = map(any)
    description = "(optional) A map of the API models used for the response's content type"
    default     = {}
}

variable "APIIntegrationContentType" {
    description = "Content Type for Content-Type header."
    type        = string
    default     = "'application/json'"
}

variable "APIContentHandling" {
    description = "content handling"
    type        = string
    default     = "CONVERT_TO_TEXT"
}

variable "validator" {
    description = "name of validator resource to use for this endpoint"
    type        = string
    default = "N/A"
}

variable "authorizer_id" {
    description = "ID of the API Gateway authorizer"
    type        = string
    default     = null
}