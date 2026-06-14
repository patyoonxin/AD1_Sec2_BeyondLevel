<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\OtpService;
use App\Models\User;

class AuthController extends Controller
{

    public function login(Request $request)
{
    $isAdmin = $request->has('email'); // admin sends email, user sends phone_number

    if ($isAdmin) {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);
        $user = User::where('email', $request->email)
                    ->where('role', 'admin')
                    ->first();
    } else {
        $request->validate([
            'phone_number' => 'required',
            'password' => 'required'
        ]);
        $user = User::where('phone_number', $request->phone_number)->first();
    }

    if (!$user) {
        return response()->json(['message' => 'User not found'], 404);
    }

    if (!\Hash::check($request->password, $user->password)) {
        return response()->json(['message' => 'Invalid password'], 401);
    }

    // Skip OTP check for admin
    if (!$isAdmin && !$user->phone_verified) {
        return response()->json(['message' => 'Please verify OTP first'], 403);
    }

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
        'message' => 'Login successful',
        'user' => $user,
        'token' => $token
    ]);
}

    public function register(Request $request)
    {
    $request->validate([
        'name' => 'required',
        'phone_number' => 'required|unique:users',
        'password' => 'required|confirmed'
    ]);

    $user = User::create([
        'name' => $request->name,
        'phone_number' => $request->phone_number,
        'password' => bcrypt($request->password),
        'phone_verified' => false
    ]);

    // send OTP after register
    $this->otpService->generateOtp($request->phone_number);

    return response()->json([
        'message' => 'Registered. Please verify OTP',
        'phone_number' => $request->phone_number
    ]);
    }

    // Store OtpService instance
    protected $otpService;

    // Constructor to inject OtpService
    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    /**
     * 🔹 SEND OTP
     * This function is called when user enters their phone number
     * It will generate and send an OTP to that phone number
     */
    public function sendOtp(Request $request)
    {
        // Validate that phone number is provided
        $request->validate([
            'phone_number' => 'required'
        ]);

        // Call service to generate OTP
        // OTP will be saved in database and logged (for now)
        $this->otpService->generateOtp($request->phone_number);

        // Return response to frontend
        return response()->json([
            'message' => 'OTP sent successfully'
        ]);
    }

    /**
     * 🔹 VERIFY OTP + LOGIN / REGISTER
     * This function checks if the OTP entered by user is correct
     * If correct → user is logged in or created
     */
    public function verifyOtp(Request $request)
    {
    $request->validate([
        'phone_number' => 'required',
        'otp' => 'required'
    ]);

    // STEP 1: format phone (VERY IMPORTANT)
    $phone = $this->otpService->formatPhone($request->phone_number);

    // STEP 2: verify OTP
    $isValid = $this->otpService->verifyOtp($phone, $request->otp);

    if (!$isValid) {
        return response()->json([
            'message' => 'Invalid or expired OTP'
        ], 401);
    }

    // STEP 3: find user
    $user = User::where('phone_number', $phone)->first();

    if (!$user) {
        return response()->json([
            'message' => 'User not found'
        ], 404);
    }

    // STEP 4: update verification
    $user->update([
        'phone_verified' => 1
    ]);

    return response()->json([
        'message' => 'Account verified. You can now login'
    ]);
    }
}