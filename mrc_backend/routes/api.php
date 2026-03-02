<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\AdminAuthController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RoleController;
use App\Http\Controllers\Api\PermissionController;

Route::post('/login', [AuthController::class, 'login']);
Route::post('/send-otp', [AuthController::class, 'sendOtp']);
Route::post('/login-otp', [AuthController::class, 'loginWithOtp']);
Route::middleware('auth:sanctum')->post('/logout', [AuthController::class, 'logout']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::post('/admin/login', [AdminAuthController::class, 'login']);
Route::middleware('auth:sanctum')->post('/admin/logout', [AdminAuthController::class, 'logout']);

Route::apiResource('users', UserController::class);

Route::apiResource('roles', RoleController::class);
Route::apiResource('permissions', PermissionController::class);

// eCommerce Routes
use App\Http\Controllers\Api\BrandController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\AttributeController;
use App\Http\Controllers\Api\ProductController;

Route::apiResource('brands', BrandController::class);
Route::apiResource('categories', CategoryController::class);
Route::apiResource('attributes', AttributeController::class);
Route::apiResource('products', ProductController::class);
