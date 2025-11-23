<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware EnsureAdmin - Restringe acceso a usuarios con rol admin.
 */
class EnsureAdmin
{
    /**
     * Garantiza que el usuario autenticado sea admin.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || $request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Access denied. Admin role required.'
            ], 403);
        }

        return $next($request);
    }
}
