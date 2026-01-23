data "archive_file" "zip_lambdas" { 
	type             = "zip"
	source_dir      = "${path.module}/../../../lambdas/${var.lambda_name}"
	output_file_mode = "0666"
	output_path      = "${path.module}/zip/${var.lambda_name}.zip"
}

resource "aws_lambda_function" "lambdas" {
    filename         = data.archive_file.zip_lambdas.output_path
    function_name    = var.lambda_name
    role             = var.lambda_role_arn
    handler          = "index.handler"
    #layers           = lookup(local.lambda_layers, each.key, [])
    source_code_hash = data.archive_file.zip_lambdas.output_base64sha256
    timeout          = var.lambda_timeout
    runtime          = var.lambda_runtime
    memory_size      = var.lambda_memory_size
    publish          = true
}

resource "aws_cloudwatch_log_group" "logs" {
    name              = "/aws/lambda/${var.lambda_name}"
    retention_in_days = var.lambda_log_retention
    kms_key_id        = var.kms_key_arn
}