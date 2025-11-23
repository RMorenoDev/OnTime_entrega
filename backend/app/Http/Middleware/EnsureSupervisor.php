<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware EnsureSupervisor - Requiere rol supervisor o admin.
 */
class EnsureSupervisor
{
    /**
     * Garantiza que el usuario sea supervisor o admin.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (!$request->user() || !in_array($request->user()->role, ['supervisor', 'admin'])) {
            return response()->json([
                'message' => 'Access denied. Supervisor or Admin role required.'
            ], 403);
        }

        return $next($request);
    }
}
