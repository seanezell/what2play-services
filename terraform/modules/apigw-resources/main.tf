resource "aws_api_gateway_resource" "resource" {
    rest_api_id = var.APIResourceID
    parent_id   = var.APIParentID
    path_part   = var.APIPathPart
}

# OPTIONS method for CORS
resource "aws_api_gateway_method" "options_method" {
    rest_api_id   = aws_api_gateway_resource.resource.rest_api_id
    resource_id   = aws_api_gateway_resource.resource.id
    http_method   = "OPTIONS"
    authorization = "NONE"
}

resource "aws_api_gateway_method_response" "options_method_response" {
    rest_api_id = aws_api_gateway_resource.resource.rest_api_id
    resource_id = aws_api_gateway_resource.resource.id
    http_method = aws_api_gateway_method.options_method.http_method
    status_code = "200"
    response_models = {
        "application/json" = "Empty"
    }
    response_parameters = {
        "method.response.header.Access-Control-Allow-Headers" = true,
        "method.response.header.Access-Control-Allow-Methods" = true,
        "method.response.header.Access-Control-Allow-Origin"  = true
    }
    depends_on = [aws_api_gateway_method.options_method]
}

resource "aws_api_gateway_integration" "options_integration" {
    rest_api_id = aws_api_gateway_resource.resource.rest_api_id
    resource_id = aws_api_gateway_resource.resource.id
    http_method = aws_api_gateway_method.options_method.http_method
    type        = "MOCK"
    depends_on  = [aws_api_gateway_method.options_method]
    request_templates = {
        "application/json" = <<EOF
    {
    "statusCode": 200
    }
    EOF
    }
}

resource "aws_api_gateway_integration_response" "options_integration_response" {
    rest_api_id = aws_api_gateway_resource.resource.rest_api_id
    resource_id = aws_api_gateway_resource.resource.id
    http_method = aws_api_gateway_method.options_method.http_method
    status_code = aws_api_gateway_method_response.options_method_response.status_code
    response_parameters = {
        "method.response.header.Access-Control-Allow-Headers" = "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
        "method.response.header.Access-Control-Allow-Methods" = "'OPTIONS,POST,PUT,DELETE,GET'",
        "method.response.header.Access-Control-Allow-Origin"  = "'*'"
    }
    response_templates = { "application/json" = "" }
    depends_on         = [aws_api_gateway_method_response.options_method_response]
}