variable "policy_name" {
	description = "policy name"
	type = string
}

variable "role_name" {
	description = "role_name"
	type = string
}

variable "services" {
	description = "list of services to assume"
	type = list
}

variable "api_name" {
	description = "api name"
	type = string
}

variable "api_desc" {
	description = "api description"
	type = string
}

variable "api_basepath" {
	description = "api base path"
	type = string
}

variable "api_deploystage" {
	description = "api deploy stage"
	type = string
}

variable "cognito_userpool_id" {
    description = "cognito user pool id"
    type = string
}

variable "domain_name" {
	description = "domain name"
	type = string
}

variable "roots" {
	description = "list of roots"
	type = list(string)
}

# variable "endpoints" {
# 	description = "list of endpoints"
# 	type = map(any)
# }

variable "lambdas" {
	description = "List of Lambda functions to create"
	type        = map(any)
}

variable "resources" {
	description = "API Gateway Resources"
	type        = map(any)
}

variable "methods" {
	description = "API Gateway Methods"
	type        = map(any)
}