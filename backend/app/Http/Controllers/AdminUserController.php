<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Services\UserService;

class AdminUserController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    // GET ALL USERS
    public function index()
    {
        return $this->userService->getAllUsers();
    }

    public function updateRole(Request $request, $id)
    {
        return $this->userService->updateUserRole(
            $id,
            $request->role
        );
    }
}