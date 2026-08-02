<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Resend, Postmark, AWS, and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

'pterodactyl' => [
    'url' => env('PTERODACTYL_URL'),
    'application_key' => env('PTERODACTYL_APPLICATION_KEY'),
    'client_key' => env('PTERODACTYL_CLIENT_KEY'),
    'location_id' => env('PTERODACTYL_LOCATION_ID'),
    'nest_id' => env('PTERODACTYL_NEST_ID'),
    'egg_id' => env('PTERODACTYL_EGG_ID'),
    'docker_image' => env('PTERODACTYL_DOCKER_IMAGE'),
],

];
