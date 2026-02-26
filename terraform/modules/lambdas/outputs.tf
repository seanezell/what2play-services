output "invoke_arn" {
    description = "Lambda function invoke ARN"
    value       = aws_lambda_function.lambdas.invoke_arn
}

output "source_code_hash" {
    description = "Lambda function source code hash for deployment triggers"
    value       = aws_lambda_function.lambdas.source_code_hash
}