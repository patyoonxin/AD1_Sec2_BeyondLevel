<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\UserService;
use App\Models\User;

class AdminUserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    /**
     * GET CURRENT LOGGED-IN USER (FOR SIDEBAR + NAVBAR)
     */
    public function me(Request $request)
    {
        $user = $request->user();

        return response()->json([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role,
        ]);
    }

    /**
     * GET ALL USERS
     */
    public function index()
    {
        return response()->json(
            $this->userService->getAllUsers()
        );
    }

    /**
     * UPDATE USER ROLE
     */
    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|string'
        ]);

        $updated = $this->userService->updateUserRole(
            $id,
            $request->role
        );

        return response()->json([
            'message' => 'Role updated successfully',
            'data' => $updated
        ]);
    }

    /**
     * UPDATE USER INFO (ADMIN EDIT USER)
     */
    public function update(Request $request, $id)
    {
        $validated = $request->validate([
            'name'  => 'required|string',
            'email' => 'required|email',
            'role'  => 'required|string'
        ]);

        $user = User::findOrFail($id);
        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user'    => $user
        ]);
    }

    /**
     * DELETE USER
     */
    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }

    
}