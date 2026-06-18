<?php

namespace App\Http\Controllers;

use App\Services\UserService;

class DashboardController extends Controller
{
    protected $userService;

    public function __construct(UserService $userService)
    {
        $this->userService = $userService;
    }

    public function stats()
    {
        return response()->json(
            $this->userService->getDashboardStats()
        );
    }
}