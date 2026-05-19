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

    public function changePassword(Request $request)
    {
        return $this->userService->changePassword(
            $request->user(),
            $request->all()
        );
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
}