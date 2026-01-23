output "output_apigw_resource_id" {
	value = aws_api_gateway_resource.resource.id
}

output "output_apigw_http_method" {
	value = aws_api_gateway_method.method.http_method
}