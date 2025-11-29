<?php

return [

    'paths' => [
        'api/*',
        'sanctum/csrf-cookie',
    ],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'https://on-time-entrega.vercel.app', // Producción
        'http://localhost:5173',              // Desarrollo (Vite)
        'http://localhost:3000',              // Desarrollo (Alternativo)
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
