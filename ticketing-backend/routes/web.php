<?php

use App\Http\Controllers\SignatureVerificationController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/api/ticketing/verify-signature/{submission}/{role}', [SignatureVerificationController::class, 'show'])
    ->name('signature.verify');
