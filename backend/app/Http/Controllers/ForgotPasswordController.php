<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Otp;
use App\Services\OtpService;

class ForgotPasswordController extends Controller
{
    protected $otpService;

    public function __construct(OtpService $otpService)
    {
        $this->otpService = $otpService;
    }

    // ============================================
    // SEND OTP
    // ============================================
    public function sendOtp(Request $request)
    {
        $request->validate([
            'phone_number' => 'required'
        ]);

        // format phone consistently
        $phone = $this->otpService->formatPhone($request->phone_number);

        // check if user exists
        $user = User::where('phone_number', $phone)->first();

        if (!$user) {
            return response()->json([
                'message' => 'Phone number not registered'
            ], 404);
        }

        // generate OTP
        $this->otpService->generateOtp($phone);

        return response()->json([
            'message' => 'OTP sent successfully'
        ]);
    }

    // ============================================
    // RESET PASSWORD
    // ============================================
    public function resetPassword(Request $request)
    {
        $request->validate([
            'phone_number' => 'required',
            'otp' => 'required',
            'password' => 'required|min:6'
        ]);

        // format phone consistently
        $phone = $this->otpService->formatPhone($request->phone_number);

        // verify OTP
        $isValid = $this->otpService->verifyOtp($phone, $request->otp);

        if (!$isValid) {
            return response()->json([
                'message' => 'Invalid or expired OTP'
            ], 400);
        }

        // find user
        $user = User::where('phone_number', $phone)->first();

        if (!$user) {
            return response()->json([
                'message' => 'User not found'
            ], 404);
        }

        // update password
        $user->password = bcrypt($request->password);
        $user->save();

        // delete OTP after success
        Otp::where('phone_number', $phone)->delete();

        return response()->json([
            'message' => 'Password reset successful'
        ]);
    }
}