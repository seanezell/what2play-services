variable "lambda_name" {
    description = "name of the lambda function"
    type        = string
}

variable "lambda_timeout" {
    description = "timeout for the lambda function"
    type        = number
}

variable "lambda_runtime" {
    description = "runtime for the lambda function"
    type        = string
}

variable "lambda_memory_size" {
    description = "memory size for the lambda function"
    type        = number
}

variable "lambda_log_retention" {
    description = "log retention in days for the lambda function"
    type        = number
}

variable "lambda_role_arn" {
    description = "IAM role ARN for Lambda functions"
    type        = string
}

variable "kms_key_arn" {
    description = "KMS Key ARN for encrypting CloudWatch Logs"
    type        = string
}