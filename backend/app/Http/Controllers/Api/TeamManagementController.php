<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * TeamManagementController - Controlador de Gestión de Equipos
 * Permite a los admins gestionar equipos del sistema (CRUD)
 */
class TeamManagementController extends Controller
{
    /**
     * Listar todos los equipos (solo admin)
     */
    public function index()
    {
        $teams = Team::withCount('members')
            ->with('supervisor')
            ->orderBy('name', 'asc')
            ->get();

        return response()->json([
            'teams' => $teams
        ]);
    }

    /**
     * Crear equipo (solo admin)
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:teams,name',
            'supervisor_user_id' => 'nullable|exists:users,id',
        ]);

        // Validar rol de supervisor si se proporciona
        if (isset($validated['supervisor_user_id'])) {
            $supervisor = User::find($validated['supervisor_user_id']);
            if ($supervisor && !in_array($supervisor->role, ['supervisor', 'admin'])) {
                return response()->json([
                    'message' => 'Selected user must have supervisor or admin role'
                ], 422);
            }
        }

        $team = Team::create($validated);

        return response()->json([
            'message' => 'Team created successfully',
            'team' => $team->load('supervisor')
        ], 201);
    }

    /**
     * Actualizar equipo (solo admin)
     */
    public function update(Request $request, $id)
    {
        $team = Team::findOrFail($id);

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255', Rule::unique('teams')->ignore($team->id)],
            'supervisor_user_id' => 'nullable|exists:users,id',
        ]);

        // Validate supervisor role if provided
        if (isset($validated['supervisor_user_id'])) {
            $supervisor = User::find($validated['supervisor_user_id']);
            if ($supervisor && !in_array($supervisor->role, ['supervisor', 'admin'])) {
                return response()->json([
                    'message' => 'Selected user must have supervisor or admin role'
                ], 422);
            }
        }

        $team->update($validated);

        return response()->json([
            'message' => 'Team updated successfully',
            'team' => $team->load('supervisor')
        ]);
    }

    /**
     * Eliminar equipo (solo admin)
     */
    public function destroy($id)
    {
        $team = Team::withCount('members')->findOrFail($id);

        // Cannot delete team with members
        if ($team->members_count > 0) {
            return response()->json([
                'message' => 'Cannot delete team with members. Please reassign members first.'
            ], 422);
        }

        $team->delete();

        return response()->json([
            'message' => 'Team deleted successfully'
        ]);
    }

    /**
     * Obtener miembros del equipo (solo admin)
     */
    public function members($id)
    {
        $team = Team::with('members')->findOrFail($id);

        return response()->json([
            'team' => $team,
            'members' => $team->members
        ]);
    }
}
