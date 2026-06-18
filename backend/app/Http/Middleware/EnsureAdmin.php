<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Handle an incoming request and ensure the authenticated user has an admin role.
     *
     * If the user is not authenticated or their role is not 'admin',
     * a 403 Forbidden response is returned.
     *
     * @param  Request  $request
     * @param  Closure(Request): Response  $next
     * @return Response
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Admin Role Verification
        |--------------------------------------------------------------------------
        | Checks that a user is logged in and that their role column equals 'admin'.
        | This protects all admin-only complaint management endpoints.
        */
        if (! $user || $user->role !== 'admin') {
            return response()->json([
                'message' => 'Forbidden. Admin access required.',
            ], 403);
        }

        return $next($request);
    }
}
