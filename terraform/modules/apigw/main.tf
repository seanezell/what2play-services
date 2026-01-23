resource "aws_api_gateway_rest_api" "api" {
    name        = var.api_name
    description = var.api_desc
}

resource "aws_api_gateway_authorizer" "cognito_jwt" {
    name          = "what2play-jwt-authorizer"
    rest_api_id   = aws_api_gateway_rest_api.api.id
    type          = "COGNITO_USER_POOLS"
    provider_arns = [data.aws_cognito_user_pool.what2play.arn]
}

# Reference the user pool from infra repo
data "aws_cognito_user_pool" "what2play" {
    user_pool_id = var.cognito_userpool_id
}

resource "aws_api_gateway_request_validator" "body_validator" {
    name                  = "apigw_body_validator"
    rest_api_id           = aws_api_gateway_rest_api.api.id
    validate_request_body = true
}

resource "aws_api_gateway_request_validator" "querystring_validator" {
    name                        = "apigw_querystring_validator"
    rest_api_id                 = aws_api_gateway_rest_api.api.id
    validate_request_parameters = true
}

resource "aws_api_gateway_gateway_response" "apigwgwrespvalidation" {
    rest_api_id   = aws_api_gateway_rest_api.api.id
    status_code   = "400"
    response_type = "BAD_REQUEST_BODY"

    response_templates = {
        "application/json" = "{\"message\": \"$context.error.validationErrorString\"}"
    }
}