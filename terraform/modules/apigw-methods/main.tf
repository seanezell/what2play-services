resource "aws_api_gateway_method" "method" {
    rest_api_id          = var.APIResourceRestAPIID
    resource_id          = var.APIResourceID
    http_method          = var.APIHTTPMethod
    authorization        = var.APIMethodAuth
    authorizer_id        = var.APIMethodAuth == "COGNITO_USER_POOLS" ? var.authorizer_id : null
    request_models       = var.APIRequestModels
    request_parameters   = var.APIMethodRequestParameters
    request_validator_id = var.validator != "N/A" ? var.validator : null
}

resource "aws_api_gateway_method_response" "method_response" {
    rest_api_id     = var.APIResourceRestAPIID
    resource_id     = var.APIResourceID
    http_method     = aws_api_gateway_method.method.http_method
    status_code     = "200"
    response_models = var.APIResponseModels
    response_parameters = {
        "method.response.header.Access-Control-Allow-Origin" = true
        "method.response.header.Content-Type"                = true
    }
    depends_on = [aws_api_gateway_method.method]
}

resource "aws_api_gateway_integration" "integration" {
    rest_api_id             = var.APIResourceRestAPIID
    resource_id             = var.APIResourceID
    http_method             = aws_api_gateway_method.method.http_method
    integration_http_method = var.APIIntegrationHTTPMethod
    type                    = var.APIIntegrationType
    uri                     = var.APIIntegrationURI
    credentials             = var.APIIntegrationRole
    request_templates       = var.APIRequestTemplates
    passthrough_behavior    = var.APIPassthroughBehavior
    request_parameters      = var.APIIntegrationRequestParameters
    cache_key_parameters    = var.APICacheKeyParams
}

resource "aws_api_gateway_integration_response" "integration_response" {
    rest_api_id      = var.APIResourceRestAPIID
    resource_id      = var.APIResourceID
    http_method      = aws_api_gateway_method.method.http_method
    status_code      = aws_api_gateway_method_response.method_response.status_code
    content_handling = var.APIContentHandling
    response_parameters = {
        "method.response.header.Access-Control-Allow-Origin" = "'*'"
        "method.response.header.Content-Type"                = var.APIIntegrationContentType
    }
    depends_on         = [aws_api_gateway_integration.integration]
    response_templates = var.APIResponseTemplates
}