<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\SubmissionController;
use App\Http\Controllers\Api\ApprovalController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user',      [AuthController::class, 'user']);

    // Submission Routes
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

    Route::post('/submissions/{submission}/cancel', [
        SubmissionController::class,
        'cancel'
    ]);

    // Dashboard Stats Routes
    Route::get('/dashboard/stats', [
        SubmissionController::class,
        'dashboardStats'
    ]);

    // Approval Routes
    Route::get('/approvals', [
        ApprovalController::class,
        'index'
    ]);

    Route::get('/approvals/{submission}', [
        ApprovalController::class,
        'show'
    ]);

    Route::post('/approvals/{submission}/approve-divhead', [
        ApprovalController::class,
        'approveDivHead'
    ]);

    Route::post('/approvals/{submission}/fill-accounting', [
        ApprovalController::class,
        'fillAccounting'
    ]);

    Route::post('/approvals/{submission}/approve-accounting', [
        ApprovalController::class,
        'approveAccounting'
    ]);

    Route::post('/approvals/{submission}/fill-tax', [
        ApprovalController::class,
        'fillTax'
    ]);

    Route::post('/approvals/{submission}/approve-tax', [
        ApprovalController::class,
        'approveTax'
    ]);

    Route::post('/approvals/{submission}/resolve', [
        ApprovalController::class,
        'resolve'
    ]);

    Route::post('/approvals/{submission}/cancel', [
        ApprovalController::class,
        'cancel'
    ]);

    Route::post('/approvals/{submission}/reject', [
        ApprovalController::class,
        'reject'
    ]);

    Route::post('/approvals/{submission}/revise', [
        ApprovalController::class,
        'revise',
    ]);
});
