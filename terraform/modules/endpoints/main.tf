# resource "aws_api_gateway_resource" "resource" {
#     rest_api_id = var.APIResourceID
#     parent_id   = var.APIParentID
#     path_part   = var.APIPathPart
# }

resource "aws_api_gateway_method" "method" {
    rest_api_id          = aws_api_gateway_resource.resource.rest_api_id
    resource_id          = aws_api_gateway_resource.resource.id
    http_method          = var.APIHTTPMethod
    authorization        = var.APIMethodAuth
    authorizer_id        = var.APIMethodAuth == "COGNITO_USER_POOLS" ? var.authorizer_id : null
    request_models       = var.APIRequestModels
    request_parameters   = var.APIMethodRequestParameters
    request_validator_id = var.validator != "N/A" ? var.validator : null
}

resource "aws_api_gateway_method_response" "method_response" {
    rest_api_id     = aws_api_gateway_resource.resource.rest_api_id
    resource_id     = aws_api_gateway_resource.resource.id
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
    rest_api_id             = aws_api_gateway_resource.resource.rest_api_id
    resource_id             = aws_api_gateway_resource.resource.id
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
    rest_api_id      = aws_api_gateway_resource.resource.rest_api_id
    resource_id      = aws_api_gateway_resource.resource.id
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

# # OPTIONS method for CORS
# resource "aws_api_gateway_method" "options_method" {
#     rest_api_id   = aws_api_gateway_resource.resource.rest_api_id
#     resource_id   = aws_api_gateway_resource.resource.id
#     http_method   = "OPTIONS"
#     authorization = "NONE"
# }

# resource "aws_api_gateway_method_response" "options_method_response" {
#     rest_api_id = aws_api_gateway_resource.resource.rest_api_id
#     resource_id = aws_api_gateway_resource.resource.id
#     http_method = aws_api_gateway_method.options_method.http_method
#     status_code = "200"
#     response_models = {
#         "application/json" = "Empty"
#     }
#     response_parameters = {
#         "method.response.header.Access-Control-Allow-Headers" = true,
#         "method.response.header.Access-Control-Allow-Methods" = true,
#         "method.response.header.Access-Control-Allow-Origin"  = true
#     }
#     depends_on = [aws_api_gateway_method.options_method]
# }

# resource "aws_api_gateway_integration" "options_integration" {
#     rest_api_id = aws_api_gateway_resource.resource.rest_api_id
#     resource_id = aws_api_gateway_resource.resource.id
#     http_method = aws_api_gateway_method.options_method.http_method
#     type        = "MOCK"
#     depends_on  = [aws_api_gateway_method.options_method]
#     request_templates = {
#         "application/json" = <<EOF
#     {
#     "statusCode": 200
#     }
#     EOF
#     }
# }

# resource "aws_api_gateway_integration_response" "options_integration_response" {
#     rest_api_id = aws_api_gateway_resource.resource.rest_api_id
#     resource_id = aws_api_gateway_resource.resource.id
#     http_method = aws_api_gateway_method.options_method.http_method
#     status_code = aws_api_gateway_method_response.options_method_response.status_code
#     response_parameters = {
#         "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
#         "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST,PUT,DELETE,GET'",
#         "method.response.header.Access-Control-Allow-Origin"  = "'*'"
#     }
#     response_templates = { "application/json" = "" }
#     depends_on         = [aws_api_gateway_method_response.options_method_response]
# }
