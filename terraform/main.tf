terraform {
    backend "s3" {
        bucket         = "seanezell-terraform-backend"
        key            = "what2play-services/terraform.tfstate"
        region         = "us-west-2"
        dynamodb_table = "terraform_state"
    }
}

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

resource "aws_kms_key" "cloudwatch_logs" {
    description = "KMS key for CloudWatch log group encryption"
    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Sid    = "Enable IAM User Permissions"
                Effect = "Allow"
                Principal = {
                    AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
                }
                Action   = "kms:*"
                Resource = "*"
            },
            {
                Sid    = "Allow CloudWatch Logs"
                Effect = "Allow"
                Principal = {
                    Service = "logs.${data.aws_region.current.region}.amazonaws.com"
                }
                Action = [
                    "kms:Encrypt",
                    "kms:Decrypt",
                    "kms:ReEncrypt*",
                    "kms:GenerateDataKey*",
                    "kms:DescribeKey"
                ]
                Resource = "*"
                Condition = {
                    ArnEquals = {
                        "kms:EncryptionContext:aws:logs:arn" = "arn:aws:logs:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:*"
                    }
                }
            }
        ]
    })
}

resource "aws_kms_alias" "cloudwatch_logs" {
    name          = "alias/what2play-cloudwatch-logs"
    target_key_id = aws_kms_key.cloudwatch_logs.key_id
}

data "aws_iam_policy_document" "lambda_doc" {
    statement {
        sid    = "CreateSelfLogGroup"
        effect = "Allow"
        actions = [
            "logs:CreateLogStream",
			"logs:DescribeLogGroups",
			"logs:DescribeLogStreams",
			"logs:PutLogEvents",
			"logs:GetLogEvents",
			"logs:FilterLogEvents",
			"logs:CreateLogDelivery",
			"logs:GetLogDelivery",
			"logs:UpdateLogDelivery",
			"logs:DeleteLogDelivery",
			"logs:ListLogDeliveries",
			"logs:PutResourcePolicy",
			"logs:DescribeResourcePolicies",
			"logs:DescribeLogGroups"
        ]
        resources = ["*"]
    }
    statement {
        sid    = "lambdaInvokeStatement"
        effect = "Allow"
        actions = [
            "lambda:GetFunction",
            "lambda:InvokeFunction"
        ]
        resources = [
            "arn:aws:lambda:${data.aws_region.current.region}:${data.aws_caller_identity.current.id}:function:*"
        ]
    }
    statement {
        sid    = "DDB"
        effect = "Allow"
        actions = [
            "dynamodb:PutItem",
            "dynamodb:GetItem",
            "dynamodb:DeleteItem",
            "dynamodb:UpdateItem",
            "dynamodb:Scan",
            "dynamodb:Query"
        ]
        resources = [
            "arn:aws:dynamodb:${data.aws_region.current.region}:${data.aws_caller_identity.current.id}:table/*"
        ]
    }
}

module "roles_n_policies" {
    source = "./modules/iam"
    PolicyName   = var.policy_name
    RoleName     = var.role_name
    Policy       = data.aws_iam_policy_document.lambda_doc.json
    ServicesList = var.services
}

module "lambdas" {
    for_each = var.lambdas
    source   = "./modules/lambdas"

    lambda_name          = each.key
    lambda_timeout       = each.value.timeout
    lambda_runtime       = each.value.runtime
    lambda_memory_size   = each.value.memory_size
    lambda_log_retention = each.value.log_retention
    lambda_role_arn      = module.roles_n_policies.output_roleid
    kms_key_arn          = aws_kms_key.cloudwatch_logs.arn
}

module "apigw" {
    source = "./modules/apigw"

    api_name        = var.api_name
    api_desc        = var.api_desc
    cognito_userpool_id = var.cognito_userpool_id
}

resource "aws_cloudwatch_log_group" "api_cw" {
    depends_on        = [aws_api_gateway_stage.StageSettings]
    name              = "API-Gateway-Execution-Logs_${module.apigw.apigw_id}/${aws_api_gateway_stage.StageSettings.stage_name}"
    retention_in_days = 14
    kms_key_id        = aws_kms_key.cloudwatch_logs.arn
}

resource "aws_api_gateway_resource" "roots" {
    for_each    = toset(var.roots)
    rest_api_id = module.apigw.apigw_id
    parent_id   = module.apigw.apigw_root_resource_id
    path_part   = each.value
}

module "apigw_endpoints" {
    for_each = var.endpoints
    source = "./modules/endpoints"
    APIResourceID = module.apigw.apigw_id
    APIParentID = each.value.root != "root" ? aws_api_gateway_resource.roots[each.value.root].id : module.apigw.apigw_root_resource_id
    APIPathPart              = each.key
    APIHTTPMethod            = each.value.method
    APIIntegrationHTTPMethod = each.value.integration_method
    APIRequestModels         = each.value.request_schema != "" ? { "application/json" = aws_api_gateway_model.request_models["${each.key}"].name } : null
    StatusCode               = "200" 
    APIIntegrationURI = each.value.uri_type != "uri" ? module.lambdas["${each.value.uri}"].invoke_arn : each.value.uri
    APIIntegrationType = each.value.type
    APIIntegrationRole = module.roles_n_policies.output_roleid
    APIRequestTemplates  = each.value.request_mapping != "" ? { "application/json" = file("${path.module}/mapping-templates/${each.value.request_mapping}.vtl") } : null
    APIResponseTemplates = each.value.response_mapping != "" ? { "application/json" = file("${path.module}/mapping-templates/${each.value.response_mapping}.vtl") } : null
    APIMethodRequestParameters      = each.value.method != "POST" ? each.value.methodReqParams : {}
    APIIntegrationRequestParameters = each.value.method != "POST" ? each.value.integrationReqParams : {}
    validator = each.value.validator == "body_validator" ? module.apigw.apigw_validator_body_id : module.apigw.apigw_validator_querystring_id
    authorizer_id = module.apigw.cognito_authorizer_id
}

resource "aws_api_gateway_model" "request_models" {
    for_each     = { for k, v in var.endpoints : k => v if v.method != "GET" && v.request_schema != "" }
    rest_api_id  = module.apigw.apigw_id
    name         = "${each.key}Model"
    description  = "request payload for ${each.key}"
    content_type = "application/json"
    schema       = file("${path.module}/schemas/${each.value.request_schema}.json")
}

module "response_400" {
    for_each = var.endpoints
    source = "./modules/responses"
    depends_on                      = [module.apigw_endpoints]
    APIParentID                     = module.apigw.apigw_id
    APIResourceID                   = module.apigw_endpoints["${each.key}"].output_apigw_resource_id
    APIHTTPMethod                   = module.apigw_endpoints["${each.key}"].output_apigw_http_method
    StatusCode                      = "400"
    SelectionPattern                = ".*statusCode.*400.*"
    APIIntegrationResponseTemplates = { "application/json" = file("${path.module}/mapping-templates/responses-errors.vtl") }
    APIIntegrationAllowedOrigin     = "'*'"
}

module "response_401" {
    for_each = var.endpoints
    source = "./modules/responses"
    depends_on                      = [module.apigw_endpoints]
    APIParentID                     = module.apigw.apigw_id
    APIResourceID                   = module.apigw_endpoints["${each.key}"].output_apigw_resource_id
    APIHTTPMethod                   = module.apigw_endpoints["${each.key}"].output_apigw_http_method
    StatusCode                      = "401"
    SelectionPattern                = ".*[Uu]nauthorized.*|.*[Aa]uthorization.*"
    APIIntegrationResponseTemplates = { "application/json" = file("${path.module}/mapping-templates/responses-errors.vtl") }
    APIIntegrationAllowedOrigin     = "'*'"
}

module "response_403" {
    for_each = var.endpoints
    source = "./modules/responses"
    depends_on                      = [module.apigw_endpoints]
    APIParentID                     = module.apigw.apigw_id
    APIResourceID                   = module.apigw_endpoints["${each.key}"].output_apigw_resource_id
    APIHTTPMethod                   = module.apigw_endpoints["${each.key}"].output_apigw_http_method
    StatusCode                      = "403"
    SelectionPattern                = ".*statusCode.*403.*"
    APIIntegrationResponseTemplates = { "application/json" = file("${path.module}/mapping-templates/responses-errors.vtl") }
    APIIntegrationAllowedOrigin     = "'*'"
}

module "response_500" {
    for_each = var.endpoints
    source = "./modules/responses"
    depends_on                      = [module.apigw_endpoints]
    APIParentID                     = module.apigw.apigw_id
    APIResourceID                   = module.apigw_endpoints["${each.key}"].output_apigw_resource_id
    APIHTTPMethod                   = module.apigw_endpoints["${each.key}"].output_apigw_http_method
    StatusCode                      = "500"
    SelectionPattern                = ".*statusCode.*500.*"
    APIIntegrationResponseTemplates = { "application/json" = file("${path.module}/mapping-templates/responses-errors.vtl") }
    APIIntegrationAllowedOrigin     = "'*'"
}

resource "aws_api_gateway_deployment" "apigw-deployment" {
    depends_on  = [module.apigw_endpoints, module.response_400, module.response_401, module.response_403, module.response_500]
    rest_api_id = module.apigw.apigw_id
    description = "Deployed on ${timestamp()}"

    triggers = {
        redeployment = sha1(join("", concat(
            # Lambda code changes
            [for k, v in module.lambdas : v.source_code_hash],
            # External template files
            [for file in fileset("${path.module}/mapping-templates", "*.vtl") : filesha1("${path.module}/mapping-templates/${file}")],
            # Schema files
            [for file in fileset("${path.module}/schemas", "*.json") : filesha1("${path.module}/schemas/${file}")]
        )))
    }

    lifecycle {
        create_before_destroy = true
    }
}

resource "aws_api_gateway_stage" "StageSettings" {
    rest_api_id   = module.apigw.apigw_id
    deployment_id = aws_api_gateway_deployment.apigw-deployment.id
    stage_name    = var.api_deploystage
}

resource "aws_api_gateway_method_settings" "s" {
    rest_api_id = module.apigw.apigw_id
    stage_name  = aws_api_gateway_stage.StageSettings.stage_name
    method_path = "*/*"

    settings {
        metrics_enabled    = true
        logging_level      = "ERROR"
        data_trace_enabled = true
    }
}

/* API Gateway Base Path Mapping */
resource "aws_api_gateway_base_path_mapping" "apigw-bpm" {
    api_id      = module.apigw.apigw_id
    domain_name = var.domain_name
    base_path   = var.api_basepath
    stage_name  = aws_api_gateway_stage.StageSettings.stage_name
}

resource "aws_dynamodb_table" "what2play" {
    name           = "what2play"
    billing_mode   = "PAY_PER_REQUEST"
    hash_key       = "PK"
    range_key      = "SK"

    attribute {
        name = "PK"
        type = "S"
    }
    
    attribute {
        name = "SK" 
        type = "S"
    }

    attribute {
        name = "GSI1PK"
        type = "S"
    }

    attribute {
        name = "GSI1SK"
        type = "S"
    }

    global_secondary_index {
        name     = "GSI1"
        hash_key = "GSI1PK"
        range_key = "GSI1SK"
        projection_type = "ALL"
    }
}
