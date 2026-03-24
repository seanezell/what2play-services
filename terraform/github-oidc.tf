# Use existing GitHub OIDC Provider
data "aws_iam_openid_connect_provider" "github_actions" {
    url = "https://token.actions.githubusercontent.com"
}

# GitHub Actions deploy role: intentionally broad IAM *actions* (Terraform needs many verbs)
# with *resources* scoped to this stack (personal portfolio project; single AWS account).
# Tighten ARNs here when adding infra; use CloudTrail on this role if you need to discover calls.
locals {
    github_actions_role_name = "what2play-services_githubaction_role"
    tf_backend_bucket        = "seanezell-terraform-backend"
    ddb_table_names          = ["terraform_state", "what2play", "what2play-picks"]

    gh_act_account_id = data.aws_caller_identity.current.account_id
    gh_act_region     = data.aws_region.current.region

    gh_act_dynamodb_arns = flatten([
        for name in local.ddb_table_names : [
            "arn:aws:dynamodb:${local.gh_act_region}:${local.gh_act_account_id}:table/${name}",
            "arn:aws:dynamodb:${local.gh_act_region}:${local.gh_act_account_id}:table/${name}/index/*",
        ]
    ])

    gh_act_lambda_arns = [
        "arn:aws:lambda:${local.gh_act_region}:${local.gh_act_account_id}:function:what2play-*",
        "arn:aws:lambda:${local.gh_act_region}:${local.gh_act_account_id}:function:what2play-*:*",
    ]

    # Scoped log-group ARNs for mutating APIs. DescribeLogGroups / DescribeLogStreams are list APIs and
    # only match IAM when Resource is "*" (AWS shows a odd log-group::log-stream ARN in denial messages).
    gh_act_log_group_arns = [
        "arn:aws:logs:${local.gh_act_region}:${local.gh_act_account_id}:log-group:/aws/lambda/what2play-*",
        "arn:aws:logs:${local.gh_act_region}:${local.gh_act_account_id}:log-group:/aws/lambda/what2play-*:log-stream:*",
        "arn:aws:logs:${local.gh_act_region}:${local.gh_act_account_id}:log-group:API-Gateway-Execution-Logs_*",
        "arn:aws:logs:${local.gh_act_region}:${local.gh_act_account_id}:log-group:API-Gateway-Execution-Logs_*:log-stream:*",
    ]

    # API Gateway control-plane ARNs omit the account field on purpose — region::/path is correct.
    gh_act_apigateway_arns = [
        "arn:aws:apigateway:${local.gh_act_region}::/account",
        "arn:aws:apigateway:${local.gh_act_region}::/restapis",
        "arn:aws:apigateway:${local.gh_act_region}::/restapis/*",
        "arn:aws:apigateway:${local.gh_act_region}::/domainnames/${var.domain_name}",
    ]

    gh_act_kms_arns = [
        "arn:aws:kms:${local.gh_act_region}:${local.gh_act_account_id}:key/*",
        "arn:aws:kms:${local.gh_act_region}:${local.gh_act_account_id}:alias/what2play-cloudwatch-logs",
    ]

    gh_act_iam_passrole_targets = [
        "arn:aws:iam::${local.gh_act_account_id}:role/${var.role_name}",
    ]

    # Policy + OIDC: iam:* is OK here (PassRole only targets roles, not these ARNs).
    gh_act_iam_policy_oidc_arns = [
        "arn:aws:iam::${local.gh_act_account_id}:policy/${var.policy_name}",
        "arn:aws:iam::${local.gh_act_account_id}:oidc-provider/token.actions.githubusercontent.com",
    ]

    # Roles: cannot use iam:* here — it would allow PassRole without the Lambda-only condition.
    # AWS also rejects Action and NotAction in the same statement.
    gh_act_iam_role_arns = [
        "arn:aws:iam::${local.gh_act_account_id}:role/${var.role_name}",
        "arn:aws:iam::${local.gh_act_account_id}:role/${local.github_actions_role_name}",
    ]

    gh_act_iam_role_admin_actions = [
        "iam:AttachRolePolicy",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:DeleteRolePolicy",
        "iam:DetachRolePolicy",
        "iam:GetRole",
        "iam:GetRolePolicy",
        "iam:ListAttachedRolePolicies",
        "iam:ListInstanceProfilesForRole",
        "iam:ListRolePolicies",
        "iam:ListRoleTags",
        "iam:PutRolePolicy",
        "iam:TagRole",
        "iam:UntagRole",
        "iam:UpdateAssumeRolePolicy",
    ]
}

# IAM Role for GitHub Actions
resource "aws_iam_role" "github_actions_role" {
    name = local.github_actions_role_name

    assume_role_policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Principal = {
                    Federated = data.aws_iam_openid_connect_provider.github_actions.arn
                }
                Action = "sts:AssumeRoleWithWebIdentity"
                Condition = {
                    StringEquals = {
                        "token.actions.githubusercontent.com:aud" = "sts.amazonaws.com"
                    }
                    StringLike = {
                        "token.actions.githubusercontent.com:sub" = "repo:seanezell/what2play-*:ref:refs/heads/*"
                    }
                }
            }
        ]
    })
}

# Attach policies to the role
resource "aws_iam_role_policy" "github_actions_terraform_policy" {
    name = "what2play-services_githubaction_policy"
    role = aws_iam_role.github_actions_role.id

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Sid    = "STS"
                Effect = "Allow"
                Action = ["sts:GetCallerIdentity"]
                Resource = "*"
            },
            {
                Sid    = "S3TerraformBackend"
                Effect = "Allow"
                Action = ["s3:*"]
                Resource = [
                    "arn:aws:s3:::${local.tf_backend_bucket}",
                    "arn:aws:s3:::${local.tf_backend_bucket}/*",
                ]
            },
            {
                Sid    = "DynamoDBStackAndStateLock"
                Effect = "Allow"
                Action = ["dynamodb:*"]
                Resource = local.gh_act_dynamodb_arns
            },
            {
                Sid      = "DynamoDBListTables"
                Effect   = "Allow"
                Action   = ["dynamodb:ListTables"]
                Resource = "*"
            },
            {
                Sid    = "LambdaWhat2Play"
                Effect = "Allow"
                Action = ["lambda:*"]
                Resource = local.gh_act_lambda_arns
            },
            {
                Sid    = "CloudWatchLogsWhat2Play"
                Effect = "Allow"
                Action = ["logs:*"]
                Resource = local.gh_act_log_group_arns
            },
            {
                Sid    = "CloudWatchLogsDescribeNoResourceArn"
                Effect = "Allow"
                Action = [
                    "logs:DescribeLogGroups",
                    "logs:DescribeLogStreams",
                ]
                Resource = "*"
            },
            {
                Sid    = "ApiGatewayRestAndDomains"
                Effect = "Allow"
                Action = ["apigateway:*"]
                Resource = local.gh_act_apigateway_arns
            },
            {
                Sid    = "CognitoUserPoolRead"
                Effect = "Allow"
                Action = ["cognito-idp:*"]
                Resource = [
                    "arn:aws:cognito-idp:${local.gh_act_region}:${local.gh_act_account_id}:userpool/${var.cognito_userpool_id}",
                ]
            },
            {
                Sid    = "KmsAccountKeysAndAlias"
                Effect = "Allow"
                Action = ["kms:*"]
                Resource = local.gh_act_kms_arns
            },
            {
                Sid      = "KmsListAliases"
                Effect   = "Allow"
                Action   = ["kms:ListAliases"]
                Resource = "*"
            },
            {
                Sid      = "IamPassRoleToLambdaOnly"
                Effect   = "Allow"
                Action   = ["iam:PassRole"]
                Resource = local.gh_act_iam_passrole_targets
                Condition = {
                    StringEquals = {
                        "iam:PassedToService" = "lambda.amazonaws.com"
                    }
                }
            },
            {
                Sid      = "IamPolicyAndOidc"
                Effect   = "Allow"
                Action   = ["iam:*"]
                Resource = local.gh_act_iam_policy_oidc_arns
            },
            {
                Sid      = "IamRolesNoPassRole"
                Effect   = "Allow"
                Action   = local.gh_act_iam_role_admin_actions
                Resource = local.gh_act_iam_role_arns
            },
            {
                Sid    = "IamCreateServiceLinkedRole"
                Effect = "Allow"
                Action = ["iam:CreateServiceLinkedRole"]
                Resource = "*"
                Condition = {
                    StringEquals = {
                        "iam:AWSServiceName" = [
                            "apigateway.amazonaws.com",
                        ]
                    }
                }
            },
            {
                Sid    = "IamListOidcProviders"
                Effect = "Allow"
                Action = ["iam:ListOpenIDConnectProviders"]
                Resource = "*"
            },
        ]
    })
}

# Output the role ARN to use in GitHub secrets
output "github_actions_role_arn" {
    value       = aws_iam_role.github_actions_role.arn
    description = "ARN of the IAM role for What2Play-Services GitHub Actions"
}
