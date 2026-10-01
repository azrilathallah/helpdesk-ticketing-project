<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubmissionController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',      [AuthController::class, 'user']);

    Route::get('/submissions', [
        SubmissionController::class,
        'index'
    ]);

    Route::post('/submissions', [
        SubmissionController::class,
        'store'
    ]);

    Route::get('/submissions/{submission}', [
        SubmissionController::class,
        'show'
    ]);

    Route::post('/submissions/{submission}', [
        SubmissionController::class,
        'update'
    ]);
});

