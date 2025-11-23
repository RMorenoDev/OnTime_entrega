<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\WorkBreak;
use App\Models\WorkSession;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * BreakController - Controlador de Pausas
 * Gestiona el inicio y fin de pausas durante la jornada laboral
 */
class BreakController extends Controller
{
    /**
     * Iniciar pausa - Comienza un descanso durante la jornada
     */
    public function start(Request $request)
    {
        $user = Auth::user();

        // Validar datos de la pausa (tipo y si es pagada)
        $request->validate([
            'break_type' => 'required|string|max:50', // Ej: lunch, coffee, personal
            'is_paid' => 'required|boolean', // Pausa pagada o no
            'note' => 'nullable|string|max:255',
        ]);

        // Verificar que el usuario tenga una sesión activa
        $activeSession = WorkSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        // No se puede pausar si no está fichado
        if (!$activeSession) {
            return response()->json([
                'message' => 'No active work session found. Please clock in first.'
            ], 422);
        }

        // Verificar que no haya ya una pausa activa
        $activeBreak = WorkBreak::where('work_session_id', $activeSession->id)
            ->whereNull('ended_at')
            ->first();

        // No se pueden tener dos pausas simultáneas
        if ($activeBreak) {
            return response()->json([
                'message' => 'You already have an active break',
                'break' => $activeBreak
            ], 422);
        }

        // Crear nueva pausa
        $break = WorkBreak::create([
            'work_session_id' => $activeSession->id,
            'break_type' => $request->break_type,
            'is_paid' => $request->is_paid, // Si la pausa cuenta como tiempo trabajado
            'started_at' => now(), // Hora de inicio de la pausa
            'note' => $request->note,
        ]);

        return response()->json([
            'message' => 'Break started successfully',
            'break' => $break
        ], 201);
    }

    /**
     * Finalizar pausa - Termina el descanso actual
     */
    public function end(Request $request)
    {
        $user = Auth::user();

        // Buscar la sesión activa del usuario
        $activeSession = WorkSession::where('user_id', $user->id)
            ->whereNull('ended_at')
            ->first();

        // Si no hay sesión activa, error
        if (!$activeSession) {
            return response()->json([
                'message' => 'No active work session found'
            ], 404);
        }

        // Buscar la pausa activa de la sesión
        $break = WorkBreak::where('work_session_id', $activeSession->id)
            ->whereNull('ended_at')
            ->first();

        // Si no hay pausa activa, error
        if (!$break) {
            return response()->json([
                'message' => 'No active break found'
            ], 404);
        }

        // Finalizar la pausa con la hora actual
        $break->update([
            'ended_at' => now(), // Hora de fin de la pausa
            'note' => $request->note ?? $break->note, // Actualizar nota si se proporciona
        ]);

        return response()->json([
            'message' => 'Break ended successfully',
            'break' => $break // Pausa ahora tiene started_at y ended_at
        ]);
    }
}
