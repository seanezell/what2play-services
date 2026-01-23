output "output_roleid" {
    value = aws_iam_role.role.arn
    description = "The ARN of the generated IAM role, used to attach roles to services"
}

output "output_role_name" {
    value = aws_iam_role.role.name
    description = "The name of the generated IAM role"
}

output "output_policy_arn" {
    value = aws_iam_policy.policy.arn
    description = "The ARN of the generated IAM policy"
}