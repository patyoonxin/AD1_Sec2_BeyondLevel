<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserService
{
    public function updateProfile($user, $data)
    {
        $user->update([
            'name' => $data['name'],
            'email' => $data['email'],
        ]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user
        ]);
    }

    public function changePassword($user, $data)
    {
        if (!Hash::check($data['current_password'], $user->password)) {
            return response()->json([
                'message' => 'Current password incorrect'
            ], 400);
        }

        $user->password = Hash::make($data['new_password']);
        $user->save();

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    public function updateUserRole($id, $role)
    {
        $user = User::findOrFail($id);

        $user->role = $role;
        $user->save();

        return response()->json([
            'message' => 'Role updated successfully',
            'user' => $user
        ]);
    }

    public function getAllUsers()
    {
    return \App\Models\User::all()->map(function ($user) {

        return [
            'id' => $user->id,
            'name' => $user->name,
            'phone_number' => $user->phone_number,

            'role' => $user->role,

            'status' => $user->email_verified_at ? 'Active' : 'Inactive',

            'registered' => optional($user->created_at)->format('d M Y'),

            'initials' => collect(explode(' ', $user->name))
                ->map(fn($n) => strtoupper(substr($n, 0, 1)))
                ->implode('')
        ];
    });
    }
}