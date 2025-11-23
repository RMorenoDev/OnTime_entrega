<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * WorkSessionController - Controlador de Sesiones de Trabajo
 * Gestiona el fichaje de entrada/salida de los empleados
 */
class WorkSessionController extends Controller
{
    /**
     * Fichar entrada - Inicia una nueva sesión de trabajo
     */
    public function clockIn(Request $request)
    {
        $user = Auth::user(); // Usuario autenticado

        // Verificar si el usuario ya tiene una sesión activa (sin ended_at)
        $activeSession = WorkSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        // Si ya hay sesión activa, no permitir fichar de nuevo
        if ($activeSession) {
            return response()->json([
                'message' => 'You already have an active work session',
                'session' => $activeSession
            ], 422);
        }

        // Crear nueva sesión de trabajo
        $session = WorkSession::create([
            'user_id' => $user->id,
            'started_at' => now(), // Hora actual de entrada
            'source' => 'employee',
            'note' => $request->note, // Nota opcional
        ]);

        return response()->json([
            'message' => 'Clocked in successfully',
            'session' => $session->load('breaks') // Incluir pausas (vacío al iniciar)
        ], 201);
    }

    /**
     * Fichar salida - Finaliza la sesión de trabajo actual
     */
    public function clockOut(Request $request)
    {
        $user = Auth::user();

        // Buscar la sesión activa del usuario
        $session = WorkSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        // Si no hay sesión activa, error
        if (!$session) {
            return response()->json([
                'message' => 'No active work session found'
            ], 404);
        }

        // Finalizar cualquier pausa activa automáticamente
        $activeBreak = $session->breaks()->whereNull('ended_at')->first();
        if ($activeBreak) {
            $activeBreak->update(['ended_at' => now()]);
        }

        // Finalizar la sesión de trabajo
        $session->update([
            'ended_at' => now(), // Hora actual de salida
            'note' => $request->note ?? $session->note,
        ]);

        return response()->json([
            'message' => 'Clocked out successfully',
            'session' => $session->load('breaks') // Incluir todas las pausas
        ]);
    }

    /**
     * Obtener sesión activa - Para mostrar en el dashboard
     */
    public function getActive()
    {
        $user = Auth::user();

        // Buscar sesión sin ended_at (activa) con sus pausas
        $session = WorkSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->with(['breaks' => function ($query) {
                $query->orderBy('started_at', 'asc'); // Ordenar pausas por inicio
            }])
            ->first();

        return response()->json([
            'session' => $session // null si no hay sesión activa
        ]);
    }

    /**
     * List user's work sessions
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        $sessions = WorkSession::where('user_id', $user->id)
            ->with('breaks')
            ->orderBy('started_at', 'desc')
            ->paginate(20);

        return response()->json($sessions);
    }
}
