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
    * CREATE NEW USER
    */
    public function store(Request $request)
    {
    $validated = $request->validate([
        'name'         => 'required|string',
        'email'        => 'nullable|email|unique:users,email',
        'phone_number' => 'required|string|unique:users,phone_number',
        'password'     => 'required|string|min:6',
        'role'         => 'required|string|in:user,admin',
        
    ]);

    $validated['password'] = bcrypt($validated['password']);
    $validated['phone_verified'] = 1; 

    $user = User::create($validated);

    return response()->json([
        'message' => 'User created successfully',
        'user'    => $user
    ], 201);
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