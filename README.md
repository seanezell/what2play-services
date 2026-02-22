# what2play-services
microservices for What 2 Play

## API Design Philosophy
This API uses explicit action verbs in URLs (`/groups/create`) rather than 
pure REST (`POST /groups`) for clarity and infrastructure optimization. 
HTTP verbs still define operations, maintaining RESTful principles where 
they provide value.


<!-- BEGIN_TF_DOCS -->
## Requirements

No requirements.

## Providers

| Name | Version |
|------|---------|
| <a name="provider_aws"></a> [aws](#provider\_aws) | 6.28.0 |

## Modules

| Name | Source | Version |
|------|--------|---------|
| <a name="module_apigw"></a> [apigw](#module\_apigw) | ./modules/apigw | n/a |
| <a name="module_apigw_methods"></a> [apigw\_methods](#module\_apigw\_methods) | ./modules/apigw-methods | n/a |
| <a name="module_apigw_resources"></a> [apigw\_resources](#module\_apigw\_resources) | ./modules/apigw-resources | n/a |
| <a name="module_lambdas"></a> [lambdas](#module\_lambdas) | ./modules/lambdas | n/a |
| <a name="module_response_400"></a> [response\_400](#module\_response\_400) | ./modules/responses | n/a |
| <a name="module_response_401"></a> [response\_401](#module\_response\_401) | ./modules/responses | n/a |
| <a name="module_response_403"></a> [response\_403](#module\_response\_403) | ./modules/responses | n/a |
| <a name="module_response_500"></a> [response\_500](#module\_response\_500) | ./modules/responses | n/a |
| <a name="module_roles_n_policies"></a> [roles\_n\_policies](#module\_roles\_n\_policies) | ./modules/iam | n/a |

## Resources

| Name | Type |
|------|------|
| [aws_api_gateway_base_path_mapping.apigw-bpm](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_base_path_mapping) | resource |
| [aws_api_gateway_deployment.apigw-deployment](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_deployment) | resource |
| [aws_api_gateway_method_settings.s](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_method_settings) | resource |
| [aws_api_gateway_model.request_models](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_model) | resource |
| [aws_api_gateway_resource.roots](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_resource) | resource |
| [aws_api_gateway_stage.StageSettings](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/api_gateway_stage) | resource |
| [aws_cloudwatch_log_group.api_cw](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/cloudwatch_log_group) | resource |
| [aws_dynamodb_table.what2play](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table) | resource |
| [aws_iam_role.github_actions_role](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role) | resource |
| [aws_iam_role_policy.github_actions_terraform_policy](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/iam_role_policy) | resource |
| [aws_kms_alias.cloudwatch_logs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_alias) | resource |
| [aws_kms_key.cloudwatch_logs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/kms_key) | resource |
| [aws_caller_identity.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/caller_identity) | data source |
| [aws_iam_openid_connect_provider.github_actions](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_openid_connect_provider) | data source |
| [aws_iam_policy_document.lambda_doc](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/iam_policy_document) | data source |
| [aws_region.current](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/data-sources/region) | data source |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| <a name="input_api_basepath"></a> [api\_basepath](#input\_api\_basepath) | api base path | `string` | n/a | yes |
| <a name="input_api_deploystage"></a> [api\_deploystage](#input\_api\_deploystage) | api deploy stage | `string` | n/a | yes |
| <a name="input_api_desc"></a> [api\_desc](#input\_api\_desc) | api description | `string` | n/a | yes |
| <a name="input_api_name"></a> [api\_name](#input\_api\_name) | api name | `string` | n/a | yes |
| <a name="input_cognito_userpool_id"></a> [cognito\_userpool\_id](#input\_cognito\_userpool\_id) | cognito user pool id | `string` | n/a | yes |
| <a name="input_domain_name"></a> [domain\_name](#input\_domain\_name) | domain name | `string` | n/a | yes |
| <a name="input_lambdas"></a> [lambdas](#input\_lambdas) | List of Lambda functions to create | `map(any)` | n/a | yes |
| <a name="input_methods"></a> [methods](#input\_methods) | API Gateway Methods | `map(any)` | n/a | yes |
| <a name="input_policy_name"></a> [policy\_name](#input\_policy\_name) | policy name | `string` | n/a | yes |
| <a name="input_resources"></a> [resources](#input\_resources) | API Gateway Resources | `map(any)` | n/a | yes |
| <a name="input_role_name"></a> [role\_name](#input\_role\_name) | role\_name | `string` | n/a | yes |
| <a name="input_roots"></a> [roots](#input\_roots) | list of roots | `list(string)` | n/a | yes |
| <a name="input_services"></a> [services](#input\_services) | list of services to assume | `list` | n/a | yes |

## Outputs

| Name | Description |
|------|-------------|
| <a name="output_github_actions_role_arn"></a> [github\_actions\_role\_arn](#output\_github\_actions\_role\_arn) | ARN of the IAM role for What2Play-Services GitHub Actions |
<!-- END_TF_DOCS -->