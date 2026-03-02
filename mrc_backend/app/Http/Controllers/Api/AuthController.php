<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required',
            'password' => 'required',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        // Search by email or phone (phone field assumed to be 'phone')
        $user = User::where('email', $request->email)
                    ->orWhere('phone', $request->email)
                    ->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function sendOtp(Request $request)
    {
        $request->validate(['email' => 'required']);
        
        $user = User::where('email', $request->email)
                    ->orWhere('phone', $request->email)
                    ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // In a real app, generate and send a real OTP. Here we use '123456'
        return response()->json(['message' => 'OTP sent successfully (Use 123456)']);
    }

    public function loginWithOtp(Request $request)
    {
        $request->validate([
            'email' => 'required',
            'otp' => 'required'
        ]);

        $user = User::where('email', $request->email)
                    ->orWhere('phone', $request->email)
                    ->first();

        if (!$user) {
            return response()->json(['message' => 'User not found'], 404);
        }

        // Mock OTP verification
        if ($request->otp !== '123456') {
            return response()->json(['message' => 'Invalid OTP'], 401);
        }

        $token = $user->createToken('user-token')->plainTextToken;

        return response()->json([
            'user' => $user,
            'token' => $token,
        ]);
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return response()->json(['message' => 'Logged out successfully']);
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }
}
