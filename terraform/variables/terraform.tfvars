policy_name = "what2play-services-policy"
role_name   = "what2play-services-role"
services    = ["apigateway.amazonaws.com", "lambda.amazonaws.com"]

api_name        = "What2PlayAPI"
api_desc        = "What 2 Play API"
api_basepath    = "w2p"
api_deploystage = "v1"

domain_name = "api.seanezell.com"

cognito_userpool_id = "us-west-2_CVFGuHPAu"

roots = [
    "games",
    "users",
    "groups",
]

endpoints = {
    "add": {
        "root": "games"
        "uri_type": "lambda"
        "uri": "what2play-add-games"
        "method": "POST"
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-add-games-request",
        "response_mapping" : "",
        "request_schema" : "add",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "body_validator"
    }
}

lambdas = {
    "what2play-add-games": {
        "runtime": "nodejs22.x",
        "timeout": 30,
        "memory_size": 512,
        "log_retention": 14,
        "description": "Handle calls to What2Play Add Games"
    }
}