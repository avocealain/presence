<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     * @param  string  ...$roles
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        // User must be authenticated
        if (!$request->user()) {
            abort(401, 'Unauthenticated');
        }

        // User must have one of the specified roles
        if (!in_array($request->user()->role, $roles, true)) {
            abort(403, "You do not have permission to access this resource. Required roles: " . implode(', ', $roles));
        }

        return $next($request);
    }
}
