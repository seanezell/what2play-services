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
    "user",
    "usernames",
    "groups",
    "friends"
]

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
    },
    "what2play-user-profile": {
        "runtime": "nodejs22.x",
        "timeout": 30,
        "memory_size": 512,
        "log_retention": 14,
        "description": "Handle user profile operations"
    },
    "what2play-friends": {
        "runtime": "nodejs22.x",
        "timeout": 30,
        "memory_size": 512,
        "log_retention": 14,
        "description": "Handle friends operations"
    },
    "what2play-groups": {
        "runtime": "nodejs22.x",
        "timeout": 30,
        "memory_size": 512,
        "log_retention": 14,
        "description": "Handle group operations"
    }
}

resources = {
    "add-games": {
        "root": "games",
        "path": "add"        
    },
    "user-games": {
        "root": "user",
        "path": "games"
    },
    "user-game_id": {
        "root": "user",
        "path": "{game_id}"
    },
    "user-profile": {
        "root": "user",
        "path": "profile"
    }
    "username-validation": {
        "root": "usernames",
        "path": "validate"
    },
    "friends-list": {
        "root": "friends",
        "path": "list"
    },
    "friends-search": {
        "root": "friends",
        "path": "search"
    },
    "friends-user_id": {
        "root": "friends",
        "path": "{friend_user_id}"
    },
    "groups-create": {
        "root": "groups",
        "path": "create"
    },
    "groups-list": {
        "root": "groups",
        "path": "list"
    },
    "groups-group_id": {
        "root": "groups",
        "path": "{group_id}"
    },
    "groups-pick": {
        "root": "groups",
        "path": "pick"
    }
}

methods = {
    "add": {
        "resource": "add-games",
        "uri_type": "lambda",
        "uri": "what2play-add-games",
        "method": "POST",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-add-games-request",
        "response_mapping" : "",
        "request_schema" : "add",
        "model": "addGameModel",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "body_validator"
    },
    "user-get-games": {
        "resource": "user-games",
        "uri_type": "lambda",
        "uri": "what2play-user-games",
        "method": "GET",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-user-games-request",
        "response_mapping" : "",
        "request_schema" : "",
        "model": "",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "querystring_validator"
    },
    "user-delete-game": {
        "resource": "user-game_id",
        "uri_type": "lambda",
        "uri": "what2play-user-games",
        "method": "DELETE",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-user-games-request",
        "response_mapping" : "",
        "request_schema" : "",
        "model": "",
        "methodReqParams" : {"method.request.path.game_id": true},
        "integrationReqParams" : {"integration.request.path.game_id": "method.request.path.game_id"},
        "validator" : "querystring_validator"
    },
    "user-update-game": {
        "resource": "user-game_id",
        "uri_type": "lambda",
        "uri": "what2play-user-games",
        "method": "PUT",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-user-games-request",
        "response_mapping" : "",
        "request_schema" : "update_game",
        "model": "updateGameModel",
        "methodReqParams" : {"method.request.path.game_id": true},
        "integrationReqParams" : {"integration.request.path.game_id": "method.request.path.game_id"},
        "validator" : "body_validator"
    },
    "user-get-profile": {
        "resource": "user-profile",
        "uri_type": "lambda",
        "uri": "what2play-user-profile",
        "method": "GET",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-user-profile-request",
        "response_mapping" : "",
        "request_schema" : "",
        "model": "",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "querystring_validator"
    },
    "user-put-profile": {
        "resource": "user-profile",
        "uri_type": "lambda",
        "uri": "what2play-user-profile",
        "method": "PUT",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-user-profile-request",
        "response_mapping" : "",
        "request_schema" : "user_profile",
        "model": "userProfileModel",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "body_validator"
    },
    "username-validation": {
        "resource": "username-validation",
        "uri_type": "lambda",
        "uri": "what2play-user-profile",
        "method": "POST",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-user-profile-request",
        "response_mapping" : "",
        "request_schema" : "validate_username",
        "model": "validateUsernameModel",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "body_validator"
    },
    "friends-list": {
        "resource": "friends-list",
        "uri_type": "lambda",
        "uri": "what2play-friends",
        "method": "GET",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-friends-request",
        "response_mapping" : "",
        "request_schema" : "",
        "model": "",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "querystring_validator"
    },
    "friends-search": {
        "resource": "friends-search",
        "uri_type": "lambda",
        "uri": "what2play-friends",
        "method": "GET",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-friends-search-request",
        "response_mapping" : "",
        "request_schema" : "",
        "model": "",
        "methodReqParams" : {"method.request.querystring.query": true},
        "integrationReqParams" : {"integration.request.querystring.query": "method.request.querystring.query"},
        "validator" : "querystring_validator"
    },
    "friends-add-friend": {
        "resource": "friends-user_id",
        "uri_type": "lambda",
        "uri": "what2play-friends",
        "method": "POST",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-friends-add-request",
        "response_mapping" : "",
        "request_schema" : "",
        "model": "",
        "methodReqParams" : {"method.request.path.friend_user_id": true},
        "integrationReqParams" : {"integration.request.path.friend_user_id": "method.request.path.friend_user_id"},
        "validator" : "querystring_validator"
    },
    "friends-remove-friend": {
        "resource": "friends-user_id",
        "uri_type": "lambda",
        "uri": "what2play-friends",
        "method": "DELETE",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-friends-remove-request",
        "response_mapping" : "",
        "request_schema" : "",
        "model": "",
        "methodReqParams" : {"method.request.path.friend_user_id": true},
        "integrationReqParams" : {"integration.request.path.friend_user_id": "method.request.path.friend_user_id"},
        "validator" : "querystring_validator"
    },
    "groups-create": {
        "resource": "groups-create",
        "uri_type": "lambda",
        "uri": "what2play-groups",
        "method": "POST",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-groups-create-request",
        "response_mapping" : "",
        "request_schema" : "create_group",
        "model": "createGroupModel",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "body_validator"
    },
    "groups-list": {
        "resource": "groups-list",
        "uri_type": "lambda",
        "uri": "what2play-groups",
        "method": "GET",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-groups-list-request",
        "response_mapping" : "",
        "request_schema" : "",
        "model": "",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "querystring_validator"
    },
    "groups-get": {
        "resource": "groups-group_id",
        "uri_type": "lambda",
        "uri": "what2play-groups",
        "method": "GET",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-groups-id-request",
        "response_mapping" : "",
        "request_schema" : "",
        "model": "",
        "methodReqParams" : {"method.request.path.group_id": true},
        "integrationReqParams" : {"integration.request.path.group_id": "method.request.path.group_id"},
        "validator" : "querystring_validator"
    },
    "groups-delete": {
        "resource": "groups-group_id",
        "uri_type": "lambda",
        "uri": "what2play-groups",
        "method": "DELETE",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-groups-id-request",
        "response_mapping" : "",
        "request_schema" : "",
        "model": "",
        "methodReqParams" : {"method.request.path.group_id": true},
        "integrationReqParams" : {"integration.request.path.group_id": "method.request.path.group_id"},
        "validator" : "querystring_validator"
    },
    "groups-pick": {
        "resource": "groups-pick",
        "uri_type": "lambda",
        "uri": "what2play-groups",
        "method": "POST",
        "integration_method" : "POST",
        "type" : "AWS",
        "request_mapping" : "what2play-groups-pick-request",
        "response_mapping" : "",
        "request_schema" : "pick_game",
        "model": "pickGameModel",
        "methodReqParams" : {},
        "integrationReqParams" : {},
        "validator" : "body_validator"
    }
}