resource "aws_api_gateway_method_response" "method_response" {
	rest_api_id   = var.APIParentID
	resource_id   = var.APIResourceID
	http_method   = var.APIHTTPMethod
	status_code   = var.StatusCode
	response_models = var.APIResponseModels
	response_parameters = {
		"method.response.header.Access-Control-Allow-Origin" = true
	}
}

resource "aws_api_gateway_integration_response" "integration_response" {
	rest_api_id   = aws_api_gateway_method_response.method_response.rest_api_id		
	resource_id   = aws_api_gateway_method_response.method_response.resource_id
	http_method   = aws_api_gateway_method_response.method_response.http_method		
	status_code   = aws_api_gateway_method_response.method_response.status_code		
	selection_pattern = var.SelectionPattern
	response_parameters = {
		"method.response.header.Access-Control-Allow-Origin" = var.APIIntegrationAllowedOrigin
	}
	response_templates = var.APIIntegrationResponseTemplates
}