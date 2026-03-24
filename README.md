# What 2 Play Services

Backend API and application data for the What 2 Play app: API Gateway, Node.js Lambdas, DynamoDB, and Terraform for this stack. Shared foundations (static hosting, Cognito, DNS, post-confirmation trigger) live in the infrastructure repo.

## Project Breadcrumbs

What 2 Play is split across multiple repos with distinct responsibilities:

- [`what2play`](https://github.com/seanezell/what2play): pseudo-parent repo for high-level docs and portfolio entrypoint
- [`what2play-infrastructure`](https://github.com/seanezell/what2play-infrastructure): Terraform-managed shared AWS infrastructure (hosting edge, auth, DNS, post-confirmation Lambda, deploy access)
- [`what2play-services`](https://github.com/seanezell/what2play-services) (this repo): API Gateway + application Lambdas + service data resources
- [`what2play-client`](https://github.com/seanezell/what2play-client): React web app

## What This Repo Owns

- REST API (API Gateway) integrated with Cognito for authenticated routes
- Lambda function source under `lambdas/*` (games, friends, groups, lists, user profile, etc.)
- Application DynamoDB tables and Lambda execution IAM wired through Terraform
- GitHub Actions OIDC role and policy used by CI to plan/apply this Terraform root module
- Remote state: S3 backend + state locking (see `terraform/main.tf` backend block)

## Repository Structure

- `terraform/`: root Terraform module (`main.tf`, `variables/`, `modules/*`, `github-oidc.tf`)
- `lambdas/`: one package per Lambda; npm workspaces + Jest at `lambdas/package.json`
- `.github/workflows/terraform-deploy.yml`: package Lambdas, then Terraform fmt/init/validate/plan/apply on `main`
- `.github/workflows/lambda-tests.yml`: `npm ci` + `npm test` on pull requests that touch `lambdas/**`
- `.cursor/rules/`: Cursor agent rules for this repo

## API Design Note

URLs use explicit action segments where it helps clarity and mapping (for example `/groups/create`) while HTTP methods still distinguish operations. Pure REST is not the goal everywhere.

## Deployment and CI

**Terraform deploy** (`.github/workflows/terraform-deploy.yml`):

- Triggers on push to `main` when `terraform/**` or `lambdas/**` change, or via `workflow_dispatch`
- Packages each Lambda (zip + `npm install --production` per function), then runs Terraform through apply

**Lambda tests** (`.github/workflows/lambda-tests.yml`):

- Runs on pull requests that change `lambdas/**` so unit tests do not duplicate on merge to `main`

Configure `AWS_ROLE_ARN` in repo secrets to the IAM role output from this stack (`github_actions_role_arn`).

## Local Development

### Terraform

```bash
cd terraform
terraform init
terraform fmt -recursive
terraform validate
terraform plan -var-file variables/terraform.tfvars
```

### Lambda unit tests

```bash
cd lambdas
npm ci
npm test
```

## Notes

- Cognito User Pool and hosted UI are created in [`what2play-infrastructure`](https://github.com/seanezell/what2play-infrastructure); this repo references the pool ID in Terraform variables.
- Frontend build and CloudFront deployment are owned by [`what2play-client`](https://github.com/seanezell/what2play-client).
- **Cursor / AI:** project rules live in [`.cursor/rules/`](.cursor/rules/). Cross-repo conventions and a template for user-global Cursor rules are in [`working-instructions/PORTFOLIO_GLOBAL.md`](working-instructions/PORTFOLIO_GLOBAL.md).

## License

Private portfolio project. Sharing details privately for interviews is welcome.

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
| <a name="module_response_404"></a> [response\_404](#module\_response\_404) | ./modules/responses | n/a |
| <a name="module_response_409"></a> [response\_409](#module\_response\_409) | ./modules/responses | n/a |
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
| [aws_dynamodb_table.what2play_picks](https://registry.terraform.io/providers/hashicorp/aws/latest/docs/resources/dynamodb_table) | resource |
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