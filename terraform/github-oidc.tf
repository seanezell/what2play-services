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
                    "apigateway:*",
                    "lambda:*",
                    "logs:*",
                    "cloudwatch:*",
                    "dynamodb:*",
                    "secretsmanager:*",
                    "iam:*",
                    "ec2:*",
                    "s3:*",
                    "cognito-idp:DescribeUserPool",
                    "kms:DescribeKey",
                    "kms:GetKeyPolicy"
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