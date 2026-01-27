policy_name = "what2play-services-policy"
role_name   = "what2play-services-role"
services    = ["apigateway.amazonaws.com", "lambda.amazonaws.com"]

api_name        = "What2PlayAPI"
api_desc        = "What 2 Play API"
api_basepath    = "w2p"
api_deploystage = "v1"

domain_name = "api.seanezell.com"

cognito_userpool_id = "us-west-2_ISZbe9AFj"

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
    },
    "games": {
        "root": "users"
        "uri_type": "lambda"
        "uri": "what2play-user-games"
        "method": "GET"
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-user-games-request",
        "response_mapping" : "",
        "request_schema" : "",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "querystring_validator"
    },
    "remove": {
        "root": "users"
        "uri_type": "lambda"
        "uri": "what2play-user-games"
        "method": "DELETE"
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-user-games-request",
        "response_mapping" : "",
        "request_schema" : "",
        "methodReqParams" : {"method.request.path.game_id": true},
        "integrationReqParams" : {"integration.request.path.game_id": "method.request.path.game_id"},
        "validator" : "querystring_validator"
    },
    "update": {
        "root": "users"
        "uri_type": "lambda"
        "uri": "what2play-user-games"
        "method": "PUT"
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-user-games-request",
        "response_mapping" : "",
        "request_schema" : "update_game",
        "methodReqParams" : {"method.request.path.game_id": true},
        "integrationReqParams" : {"integration.request.path.game_id": "method.request.path.game_id"},
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
    },
    "what2play-game-lookup": {
        "runtime": "nodejs22.x",
        "timeout": 30,
        "memory_size": 512,
        "log_retention": 14,
        "description": "Handle calls to What2Play Game Lookup"
    },
    "what2play-user-games": {
        "runtime": "nodejs22.x",
        "timeout": 30,
        "memory_size": 512,
        "log_retention": 14,
        "description": "Handle user game operations (list/remove/update)"
    }
}