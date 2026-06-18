<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;

class Authenticate extends Middleware
{
    /**
     * Redirect users when they are NOT authenticated.
     * For API, we return null so it gives JSON 401 instead of redirecting.
     */
    protected function redirectTo($request)
    {
        if (! $request->expectsJson()) {
            return null;
        }

        return null;
    }
}