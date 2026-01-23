variable "PolicyName" {
    description = "Gives a Name to the policy"
    type = string
}

variable "RoleName" {
    description = "Gives a Name to the IAM Role"
    type = string
}

variable "Policy" {
    description = "the path to the JSON policy document used to build the policy"

}

variable "ServicesList" {
    description = "List of services for the role to assume"
    default = []
    type = list
}