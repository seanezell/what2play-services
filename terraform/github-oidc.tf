# Use existing GitHub OIDC Provider
data "aws_iam_openid_connect_provider" "github_actions" {
    url = "https://token.actions.githubusercontent.com"
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

    policy = jsonencode({
        Version = "2012-10-17"
        Statement = [
            {
                Effect = "Allow"
                Action = [
                    "iam:CreateRole",
                    "iam:DeleteRole",
                    "iam:GetRole",
                    "iam:PassRole",
                    "iam:PutRolePolicy",
                    "iam:DeleteRolePolicy",
                    "iam:GetRolePolicy",
                    "iam:ListRolePolicies",
                    "iam:ListAttachedRolePolicies",
                    "iam:TagRole",
                    "iam:UntagRole",
                    "iam:GetOpenIDConnectProvider",
                    "iam:ListOpenIDConnectProviders",
                    "iam:GetPolicy",
                    "iam:GetPolicyVersion"
                ]
                Resource = "*"
            },
            {
                Effect = "Allow"
                Action = [
                    "lambda:CreateFunction",
                    "lambda:DeleteFunction",
                    "lambda:GetFunction",
                    "lambda:UpdateFunctionCode",
                    "lambda:UpdateFunctionConfiguration",
                    "lambda:AddPermission",
                    "lambda:RemovePermission",
                    "lambda:GetPolicy",
                    "lambda:ListVersionsByFunction",
                    "lambda:PublishVersion",
                    "lambda:TagResource",
                    "lambda:GetFunctionCodeSigningConfig",
                    "lambda:ListTags",
                    "lambda:GetFunctionConfiguration"
                ]
                Resource = "*"
            },
            {
                Effect = "Allow"
                Action = [
                    "logs:CreateLogGroup",
                    "logs:DeleteLogGroup",
                    "logs:DescribeLogGroups",
                    "logs:PutRetentionPolicy",
                    "logs:ListTagsLogGroup",
                    "logs:ListTagsForResource",
                    "logs:TagResource"
                ]
                Resource = "*"
            },
            {
                Effect = "Allow"
                Action = [
                    "s3:CreateBucket",
                    "s3:DeleteBucket",
                    "s3:GetBucketPolicy",
                    "s3:PutBucketPolicy",
                    "s3:DeleteBucketPolicy",
                    "s3:GetBucketPublicAccessBlock",
                    "s3:PutBucketPublicAccessBlock",
                    "s3:GetBucketTagging",
                    "s3:PutBucketTagging",
                    "s3:GetBucketAcl",
                    "s3:GetBucketCORS",
                    "s3:GetBucketWebsite",
                    "s3:GetBucketVersioning",
                    "s3:GetBucketObjectLockConfiguration",
                    "s3:GetBucketRequestPayment",
                    "s3:GetBucketLogging",
                    "s3:GetAccelerateConfiguration",
                    "s3:GetLifecycleConfiguration",
                    "s3:GetReplicationConfiguration",
                    "s3:GetEncryptionConfiguration",
                    "s3:ListBucket",
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject"
                ]
                Resource = "*"
            },
            {
                Effect = "Allow"
                Action = [
                    "dynamodb:GetItem",
                    "dynamodb:PutItem",
                    "dynamodb:DeleteItem",
                    "dynamodb:DescribeTable"
                ]
                Resource = "arn:aws:dynamodb:us-west-2:*:table/terraform_state"
            },
            {
                Effect   = "Allow"
                Action   = ["sts:GetCallerIdentity"]
                Resource = "*"
            },
            {
                Effect = "Allow"
                Action = [
                    "apigateway:*",
                    "cloudwatch:*",
                    "secretsmanager:*",
                    "ec2:*",
                    "kms:*"
                ]
                Resource = "*"
            }
        ]
    })
}

# Output the role ARN to use in GitHub secrets
output "github_actions_role_arn" {
    value       = aws_iam_role.github_actions_role.arn
    description = "ARN of the IAM role for What2Play-Services GitHub Actions"
}