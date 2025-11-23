<?php

use Illuminate\Support\Facades\Route;

// Ruta web principal
Route::get('/', function () {
    return view('welcome');
});
