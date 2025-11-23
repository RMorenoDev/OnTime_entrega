<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LeaveRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

/**
 * LeaveRequestController - Controlador de Solicitudes de Permisos
 * Gestiona solicitudes de vacaciones, bajas médicas y permisos personales
 */
class LeaveRequestController extends Controller
{
    /**
     * Crear solicitud de permiso - Los empleados crean nuevas solicitudes
     */
    public function store(Request $request)
    {
        $user = Auth::user();

        // Validar datos de la solicitud
        $validated = $request->validate([
            'leave_type' => 'required|in:vacation,medical,personal',
            'is_paid' => 'required|boolean',
            'is_full_day' => 'required|boolean',
            'duration_hours' => 'nullable|numeric|min:0.5|max:24',
            'start_at' => 'required|date',
            'end_at' => 'nullable|date|after_or_equal:start_at',
            'note' => 'required|string|max:1000',
        ]);

        // Validar horas de duración para solicitudes de medio día
        if (!$validated['is_full_day'] && !$request->duration_hours) {
            return response()->json([
                'message' => 'Duration in hours is required for partial day requests'
            ], 422);
        }

        // Validar que las horas sean en bloques de 0.5
        if (!$validated['is_full_day'] && fmod($request->duration_hours, 0.5) !== 0.0) {
            return response()->json([
                'message' => 'Duration must be in half-hour blocks (0.5, 1.0, 1.5, etc.)'
            ], 422);
        }

        // Verificar solicitudes de permiso superpuestas
        $overlapping = LeaveRequest::where('user_id', $user->id)
            ->whereIn('status', ['pending', 'approved'])
            ->where(function ($query) use ($validated) {
                $query->whereBetween('start_at', [$validated['start_at'], $validated['end_at'] ?? $validated['start_at']])
                    ->orWhereBetween('end_at', [$validated['start_at'], $validated['end_at'] ?? $validated['start_at']])
                    ->orWhere(function ($q) use ($validated) {
                        $q->where('start_at', '<=', $validated['start_at'])
                          ->where('end_at', '>=', $validated['end_at'] ?? $validated['start_at']);
                    });
            })
            ->exists();

        if ($overlapping) {
            return response()->json([
                'message' => 'You already have a leave request for this period'
            ], 422);
        }

        // Obtener supervisor del equipo del usuario
        // Si el usuario es supervisor, sus solicitudes van al admin
        // Si el usuario es empleado, sus solicitudes van al supervisor de su equipo
        $supervisor_id = null;
        if ($user->role === 'supervisor') {
            // Buscar un usuario administrador
            $admin = \App\Models\User::where('role', 'admin')->first();
            $supervisor_id = $admin?->id;
        } else {
            $supervisor_id = $user->team?->supervisor_user_id;
        }

        // Crear solicitud de permiso
        $leaveRequest = LeaveRequest::create([
            'user_id' => $user->id,
            'supervisor_id' => $supervisor_id,
            'leave_type' => $validated['leave_type'],
            'is_paid' => $validated['is_paid'],
            'is_full_day' => $validated['is_full_day'],
            'duration_hours' => $validated['duration_hours'] ?? null,
            'start_at' => $validated['start_at'],
            'end_at' => $validated['end_at'] ?? null,
            'note' => $validated['note'],
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Leave request submitted successfully',
            'leave_request' => $leaveRequest->load(['user', 'supervisor'])
        ], 201);
    }

    /**
     * Listar solicitudes propias - El empleado ve sus solicitudes
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = LeaveRequest::where('user_id', $user->id)
            ->with(['supervisor']);

        // Filtrar por estado si se proporciona
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $leaveRequests = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json($leaveRequests);
    }

    /**
     * Listar solicitudes pendientes del equipo (solo supervisores)
     */
    public function pending(Request $request)
    {
        $user = Auth::user();

        // Si el usuario es admin, mostrar todas las solicitudes de supervisores
        if ($user->role === 'admin') {
            $leaveRequests = LeaveRequest::whereHas('user', function ($query) {
                    $query->where('role', 'supervisor');
                })
                ->where('status', 'pending')
                ->with(['user'])
                ->orderBy('created_at', 'asc')
                ->get();
        } else {
            // Si el usuario es supervisor, mostrar solicitudes de miembros del equipo
            $teamMembers = \App\Models\User::where('team_id', $user->team_id)
                ->where('id', '!=', $user->id) // Excluir al supervisor mismo
                ->where('role', '!=', 'supervisor') // Excluir otros supervisores
                ->pluck('id');

            $leaveRequests = LeaveRequest::whereIn('user_id', $teamMembers)
                ->where('status', 'pending')
                ->with(['user'])
                ->orderBy('created_at', 'asc')
                ->get();
        }

        return response()->json([
            'leave_requests' => $leaveRequests
        ]);
    }

    /**
     * Listar todas las solicitudes de empleados (solo admin)
     */
    public function allEmployees(Request $request)
    {
        $user = Auth::user();

        // Solo los admins pueden ver todas las solicitudes de empleados
        if ($user->role !== 'admin') {
            return response()->json([
                'message' => 'Access denied. Admin role required.'
            ], 403);
        }

        // Obtener todas las solicitudes de empleados (excluir supervisores y admins)
        $leaveRequests = LeaveRequest::whereHas('user', function ($query) {
                $query->where('role', 'employee');
            })
            ->where('status', 'pending')
            ->with(['user'])
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json([
            'leave_requests' => $leaveRequests
        ]);
    }

    /**
     * Aprobar solicitud de permiso (supervisores y admin)
     */
    public function approve(Request $request, $id)
    {
        $user = Auth::user();

        $leaveRequest = LeaveRequest::findOrFail($id);

        // Los admins pueden aprobar cualquier solicitud
        // Los supervisores solo pueden aprobar solicitudes de su equipo
        if ($user->role === 'supervisor') {
            if ($leaveRequest->user->team_id !== $user->team_id) {
                return response()->json([
                    'message' => 'You can only approve leave requests from your team'
                ], 403);
            }
        }

        // Verificar que el estado sea pendiente
        if (!$leaveRequest->isPending()) {
            return response()->json([
                'message' => 'Only pending requests can be approved'
            ], 422);
        }

        $leaveRequest->update([
            'status' => 'approved',
            'reviewed_at' => now(),
            'supervisor_id' => $user->id,
        ]);

        return response()->json([
            'message' => 'Leave request approved successfully',
            'leave_request' => $leaveRequest->load(['user', 'supervisor'])
        ]);
    }

    /**
     * Rechazar solicitud de permiso (supervisores y admin)
     */
    public function reject(Request $request, $id)
    {
        $user = Auth::user();

        $request->validate([
            'rejection_reason' => 'required|string|max:1000'
        ]);

        $leaveRequest = LeaveRequest::findOrFail($id);

        // Los admins pueden rechazar cualquier solicitud
        // Los supervisores solo pueden rechazar solicitudes de su equipo
        if ($user->role === 'supervisor') {
            if ($leaveRequest->user->team_id !== $user->team_id) {
                return response()->json([
                    'message' => 'You can only reject leave requests from your team'
                ], 403);
            }
        }

        // Verificar que el estado sea pendiente
        if (!$leaveRequest->isPending()) {
            return response()->json([
                'message' => 'Only pending requests can be rejected'
            ], 422);
        }

        $leaveRequest->update([
            'status' => 'rejected',
            'reviewed_at' => now(),
            'supervisor_id' => $user->id,
            'rejection_reason' => $request->rejection_reason,
        ]);

        return response()->json([
            'message' => 'Leave request rejected',
            'leave_request' => $leaveRequest->load(['user', 'supervisor'])
        ]);
    }

    /**
     * Cancelar solicitud propia (empleado)
     */
    public function cancel(Request $request, $id)
    {
        $user = Auth::user();

        $leaveRequest = LeaveRequest::findOrFail($id);

        // Verificar que la solicitud pertenezca al usuario
        if ($leaveRequest->user_id !== $user->id) {
            return response()->json([
                'message' => 'You can only cancel your own leave requests'
            ], 403);
        }

        // Verificar que el estado sea pendiente o aprobado
        if (!in_array($leaveRequest->status, ['pending', 'approved'])) {
            return response()->json([
                'message' => 'Only pending or approved requests can be cancelled'
            ], 422);
        }

        $leaveRequest->update([
            'status' => 'cancelled'
        ]);

        return response()->json([
            'message' => 'Leave request cancelled successfully',
            'leave_request' => $leaveRequest
        ]);
    }
}
