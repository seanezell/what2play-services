output "apigw_id" {
    description = "API Gateway ID"
    value       = aws_api_gateway_rest_api.api.id
}

output "apigw_root_resource_id" {
    description = "API Gateway Root Resource ID"
    value       = aws_api_gateway_rest_api.api.root_resource_id
}

output "apigw_validator_body_id" {
    description = "API Gateway Body Request Validator ID"
    value       = aws_api_gateway_request_validator.body_validator.id
}

output "apigw_validator_querystring_id" {
    description = "API Gateway Querystring Request Validator ID"
    value       = aws_api_gateway_request_validator.querystring_validator.id
}

output "cognito_authorizer_id" {
    description = "Cognito User Pool Authorizer ID"
    value       = aws_api_gateway_authorizer.cognito_jwt.id
}