<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\UserService;

class ProfileController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function profile(Request $request)
    {
        return response()->json($request->user());
    }

    public function updateEmail(Request $request)
    {
        $request->validate([
            'email' => 'required|email|unique:users,email'
        ]);

        $user = auth()->user();

        $user->update([
        'email' => $request->email
        ]);

        return response()->json([
            'message' => 'Email updated successfully',
            'user' => $user
        ]);
    }

    public function updateProfile(Request $request)
    {
        $request->validate([
            'name' => 'required|string',
            'email' => 'nullable|email|unique:users,email,' . auth()->id(),
            'phone_number' => 'required|unique:users,phone_number,' . auth()->id(),
        ]);

        $user = auth()->user();

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function changePassword(Request $request)
{
    $request->validate([
        'current_password' => 'required',
        'new_password' => 'required|min:6|confirmed',
    ]);

    $user = auth()->user();

    if (!\Hash::check($request->current_password, $user->password)) {
        return response()->json([
            'message' => 'Current password is incorrect'
        ], 401);
    }

    $user->update([
        'password' => bcrypt($request->new_password)
    ]);

    return response()->json([
        'message' => 'Password changed successfully'
    ]);
}
}