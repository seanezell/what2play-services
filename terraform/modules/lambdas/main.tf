locals {
  prebuilt_zip = "${path.module}/../zip/${var.lambda_name}.zip"
  use_prebuilt = fileexists(local.prebuilt_zip)
}

data "archive_file" "zip_lambdas" {
  count            = local.use_prebuilt ? 0 : 1
  type             = "zip"
  source_dir       = "${path.module}/../../../lambdas/${var.lambda_name}"
  output_file_mode = "0666"
  output_path      = "${path.module}/zip/${var.lambda_name}.zip"
}

resource "aws_lambda_function" "lambdas" {
    filename         = local.use_prebuilt ? local.prebuilt_zip : data.archive_file.zip_lambdas[0].output_path
    function_name    = var.lambda_name
    role             = var.lambda_role_arn
    handler          = "index.handler"
    source_code_hash = local.use_prebuilt ? filebase64sha256(local.prebuilt_zip) : data.archive_file.zip_lambdas[0].output_base64sha256
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