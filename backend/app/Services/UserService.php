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
}