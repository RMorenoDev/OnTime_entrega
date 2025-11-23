<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

/**
 * UserManagementController - Controlador de Gestión de Usuarios
 * Permite a los administradores gestionar usuarios del sistema (CRUD)
 */
class UserManagementController extends Controller
{
    /**
     * Listar todos los usuarios (solo admin)
     */
    public function index(Request $request)
    {
        $query = User::with('team');

        // Buscar por nombre o email
        if ($request->search) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', "%{$request->search}%")
                  ->orWhere('email', 'like', "%{$request->search}%");
            });
        }

        // Filtrar por rol
        if ($request->role) {
            $query->where('role', $request->role);
        }

        // Filtrar por equipo
        if ($request->team_id) {
            $query->where('team_id', $request->team_id);
        }

        $users = $query->orderBy('name', 'asc')->paginate(20);

        return response()->json($users);
    }

    /**
     * Obtener detalles de un usuario (solo admin)
     */
    public function show($id)
    {
        $user = User::with('team')->findOrFail($id);

        return response()->json([
            'user' => $user
        ]);
    }

    /**
     * Actualizar usuario (solo admin)
     */
    public function update(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => ['sometimes', 'email', Rule::unique('users')->ignore($user->id)],
            'role' => 'sometimes|in:employee,supervisor,admin',
            'team_id' => 'nullable|exists:teams,id',
        ]);

        // Prevenir degradar al último admin
        if (isset($validated['role']) && $validated['role'] !== 'admin' && $user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'Cannot change role. At least one admin must exist in the system.'
                ], 422);
            }
        }

        $user->update($validated);

        return response()->json([
            'message' => 'User updated successfully',
            'user' => $user->load('team')
        ]);
    }

    /**
     * Asignar usuario a equipo (solo admin)
     */
    public function assignTeam(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'team_id' => 'nullable|exists:teams,id',
        ]);

        $user->update(['team_id' => $validated['team_id']]);

        return response()->json([
            'message' => 'User assigned to team successfully',
            'user' => $user->load('team')
        ]);
    }

    /**
     * Cambiar rol de usuario (solo admin)
     */
    public function changeRole(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $validated = $request->validate([
            'role' => 'required|in:employee,supervisor,admin',
        ]);

        // Evitar degradar al ultimo admin
        if ($validated['role'] !== 'admin' && $user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'Cannot change role. At least one admin must exist in the system.'
                ], 422);
            }
        }

        $user->update(['role' => $validated['role']]);

        return response()->json([
            'message' => 'User role changed successfully',
            'user' => $user->load('team')
        ]);
    }

    /**
     * Eliminar usuario (solo admin)
     */
    public function destroy($id)
    {
        $currentUser = Auth::user();
        $user = User::findOrFail($id);

        // No puede eliminar a sí mismo
        if ($user->id === $currentUser->id) {
            return response()->json([
                'message' => 'You cannot delete your own account'
            ], 422);
        }

        // No puede eliminar al último admin
        if ($user->role === 'admin') {
            $adminCount = User::where('role', 'admin')->count();
            if ($adminCount <= 1) {
                return response()->json([
                    'message' => 'Cannot delete the last admin user'
                ], 422);
            }
        }

        $user->delete();

        return response()->json([
            'message' => 'User deleted successfully'
        ]);
    }
}
