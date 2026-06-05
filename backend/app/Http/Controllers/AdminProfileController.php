<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AdminProfileController extends Controller
{
    // ===============================
    // FETCH ADMIN PROFILE
    // ===============================
    public function show()
    {
        $admin = User::where('role', 'admin')->first();

        return response()->json($admin);
    }

    // ===============================
    // UPDATE PROFILE
    // ===============================
    public function update(Request $request)
    {
        $admin = User::where('role', 'admin')->first();

        $validated = $request->validate([
            'name' => 'required',
            'email' => 'required|email',
            'phone_number' => 'nullable',
        ]);

        $admin->update($validated);

        return response()->json([
            'message' => 'Admin profile updated',
            'user' => $admin
        ]);
    }

    // ===============================
    // CHANGE PASSWORD
    // ===============================
    public function changePassword(Request $request)
    {
        $admin = User::where('role', 'admin')->first();

        $request->validate([
            'current_password' => 'required',
            'new_password' => 'required|min:6|confirmed',
        ]);

        // check old password
        if (!Hash::check($request->current_password, $admin->password)) {

            return response()->json([
                'message' => 'Current password incorrect'
            ], 400);
        }

        // update new password
        $admin->password = Hash::make($request->new_password);

        $admin->save();

        return response()->json([
            'message' => 'Password updated successfully'
        ]);
    }

    public function getProfile(Request $request)
    {
    return response()->json($request->user());
    }
}