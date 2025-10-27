<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

//route to verify React app is connected to Laravel backend
Route::get('/ping', function() {
    return response()->json(['message' => 'pong'], 200);
});