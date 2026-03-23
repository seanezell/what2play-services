# Use existing GitHub OIDC Provider
data "aws_iam_openid_connect_provider" "github_actions" {
  url = "https://token.actions.githubusercontent.com"
}

locals {
  # Must stay aligned with the s3 backend block in main.tf
  terraform_state_bucket        = "seanezell-terraform-backend"
  terraform_state_lock_table    = "terraform_state"
  terraform_state_object_prefix = "what2play-services/"

  github_actions_policy = {
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "TerraformStateS3"
        Effect = "Allow"
        Action = [
          "s3:GetObject",
          "s3:PutObject",
          "s3:DeleteObject",
        ]
        Resource = "arn:aws:s3:::${local.terraform_state_bucket}/${local.terraform_state_object_prefix}*"
      },
      {
        Sid    = "TerraformStateS3List"
        Effect = "Allow"
        Action = [
          "s3:ListBucket",
        ]
        Resource = "arn:aws:s3:::${local.terraform_state_bucket}"
        Condition = {
          StringLike = {
            "s3:prefix" = ["${local.terraform_state_object_prefix}*", ""]
          }
        }
      },
      {
        Sid    = "TerraformStateLock"
        Effect = "Allow"
        Action = [
          "dynamodb:DescribeTable",
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:DeleteItem",
          "dynamodb:UpdateItem",
          "dynamodb:ConditionCheckItem",
        ]
        Resource = "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:table/${local.terraform_state_lock_table}"
      },
      {
        Sid    = "StsGetCallerIdentity"
        Effect = "Allow"
        Action = [
          "sts:GetCallerIdentity",
        ]
        Resource = "*"
      },
      {
        Sid    = "ReadGitHubOidcProvider"
        Effect = "Allow"
        Action = [
          "iam:GetOpenIDConnectProvider",
        ]
        Resource = data.aws_iam_openid_connect_provider.github_actions.arn
      },
      {
        Sid    = "IamForStackAndSelf"
        Effect = "Allow"
        Action = [
          "iam:AttachRolePolicy",
          "iam:DetachRolePolicy",
          "iam:CreatePolicy",
          "iam:DeletePolicy",
          "iam:GetPolicy",
          "iam:GetPolicyVersion",
          "iam:ListPolicyVersions",
          "iam:CreatePolicyVersion",
          "iam:DeletePolicyVersion",
          "iam:TagPolicy",
          "iam:UntagPolicy",
          "iam:ListPolicyTags",
          "iam:CreateRole",
          "iam:DeleteRole",
          "iam:GetRole",
          "iam:UpdateRole",
          "iam:UpdateAssumeRolePolicy",
          "iam:PutRolePolicy",
          "iam:DeleteRolePolicy",
          "iam:GetRolePolicy",
          "iam:ListRolePolicies",
          "iam:ListAttachedRolePolicies",
          "iam:TagRole",
          "iam:UntagRole",
          "iam:ListRoleTags",
          "iam:ListOpenIDConnectProviders"
        ]
        Resource = [
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.role_name}",
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/what2play-services_githubaction_role",
          "arn:aws:iam::${data.aws_caller_identity.current.account_id}:policy/${var.policy_name}",
        ]
      },
      {
        Sid    = "PassRoleToLambdaAndApiGateway"
        Effect = "Allow"
        Action = [
          "iam:PassRole",
        ]
        Resource = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:role/${var.role_name}"
        Condition = {
          "ForAnyValue:StringEquals" = {
            "iam:PassedToService" = [
              "lambda.amazonaws.com",
              "apigateway.amazonaws.com",
            ]
          }
        }
      },
      {
        Sid    = "KmsCreateKey"
        Effect = "Allow"
        Action = [
          "kms:CreateKey",
        ]
        Resource = "*"
      },
      {
        Sid    = "KmsWhat2PlayCloudWatchLogsKey"
        Effect = "Allow"
        Action = [
          "kms:DescribeKey",
          "kms:GetKeyPolicy",
          "kms:PutKeyPolicy",
          "kms:TagResource",
          "kms:UntagResource",
          "kms:ListResourceTags",
          "kms:ScheduleKeyDeletion",
          "kms:CancelKeyDeletion",
          "kms:EnableKeyRotation",
          "kms:DisableKeyRotation",
          "kms:UpdateKeyDescription",
          "kms:Encrypt",
          "kms:Decrypt",
          "kms:GenerateDataKey",
          "kms:ReEncryptFrom",
          "kms:ReEncryptTo",
          "kms:CreateGrant",
          "kms:ListGrants",
          "kms:RevokeGrant",
          "kms:RetireGrant",
          "kms:GetKeyRotationStatus"
        ]
        Resource = aws_kms_key.cloudwatch_logs.arn
      },
      {
        Sid    = "KmsAliasWhat2PlayCloudWatchLogs"
        Effect = "Allow"
        Action = [
          "kms:CreateAlias",
          "kms:DeleteAlias",
          "kms:UpdateAlias",
          "kms:ListAliases",
        ]
        Resource = [
          aws_kms_key.cloudwatch_logs.arn,
          "arn:aws:kms:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:alias/what2play-cloudwatch-logs",
        ]
      },
      {
        Sid    = "DynamoDbAppTables"
        Effect = "Allow"
        Action = [
          "dynamodb:CreateTable",
          "dynamodb:DeleteTable",
          "dynamodb:DescribeTable",
          "dynamodb:DescribeContinuousBackups",
          "dynamodb:DescribeTimeToLive",
          "dynamodb:UpdateTable",
          "dynamodb:UpdateTimeToLive",
          "dynamodb:ListTagsOfResource",
          "dynamodb:TagResource",
          "dynamodb:UntagResource",
          "dynamodb:DescribeTableReplicaAutoScaling",
        ]
        Resource = [
          "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:table/what2play",
          "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:table/what2play/index/*",
          "arn:aws:dynamodb:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:table/what2play-picks",
        ]
      },
      {
        Sid    = "CognitoDescribeUserPool"
        Effect = "Allow"
        Action = [
          "cognito-idp:DescribeUserPool",
        ]
        Resource = "arn:aws:cognito-idp:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:userpool/${var.cognito_userpool_id}"
      },
      {
        Sid    = "LambdaWhat2Play"
        Effect = "Allow"
        Action = [
          "lambda:CreateFunction",
          "lambda:DeleteFunction",
          "lambda:GetFunction",
          "lambda:GetFunctionConfiguration",
          "lambda:GetFunctionCodeSigningConfig",
          "lambda:GetPolicy",
          "lambda:ListVersionsByFunction",
          "lambda:PublishVersion",
          "lambda:PutProvisionedConcurrencyConfig",
          "lambda:DeleteProvisionedConcurrencyConfig",
          "lambda:UpdateFunctionCode",
          "lambda:UpdateFunctionConfiguration",
          "lambda:AddPermission",
          "lambda:RemovePermission",
          "lambda:TagResource",
          "lambda:UntagResource",
          "lambda:ListTags",
        ]
        Resource = "arn:aws:lambda:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:function:what2play-*"
      },
      {
        Sid    = "LambdaListForTerraform"
        Effect = "Allow"
        Action = [
          "lambda:ListFunctions",
        ]
        Resource = "*"
      },
      {
        Sid    = "CloudWatchLogsForLambdasAndApiGw"
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:DeleteLogGroup",
          "logs:DescribeLogGroups",
          "logs:ListTagsForResource",
          "logs:ListTagsLogGroup",
          "logs:TagLogGroup",
          "logs:UntagLogGroup",
          "logs:PutRetentionPolicy",
          "logs:DeleteRetentionPolicy",
          "logs:AssociateKmsKey",
          "logs:DisassociateKmsKey",
        ]
        Resource = [
          "arn:aws:logs:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/what2play-*",
          "arn:aws:logs:${data.aws_region.current.id}:${data.aws_caller_identity.current.account_id}:log-group:API-Gateway-Execution-Logs_*",
        ]
      },
      {
        Sid    = "ApiGatewayManagement"
        Effect = "Allow"
        Action = [
          "apigateway:GET",
          "apigateway:POST",
          "apigateway:PUT",
          "apigateway:PATCH",
          "apigateway:DELETE",
          "apigateway:UpdateRestApiPolicy",
        ]
        Resource = [
          "arn:aws:apigateway:${data.aws_region.current.id}::/restapis/*",
          "arn:aws:apigateway:${data.aws_region.current.id}::/domainnames/*",
          "arn:aws:apigateway:${data.aws_region.current.id}::/account",
        ]
      },
    ]
  }
}

# IAM Role for GitHub Actions
resource "aws_iam_role" "github_actions_role" {
  name = "what2play-services_githubaction_role"

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

  policy = jsonencode(local.github_actions_policy)
}

# Output the role ARN to use in GitHub secrets
output "github_actions_role_arn" {
  value       = aws_iam_role.github_actions_role.arn
  description = "ARN of the IAM role for What2Play-Services GitHub Actions"
}
