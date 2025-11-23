<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * AuthController - Controlador de Autenticación
 * 
 * Gestiona el registro, inicio de sesión y cierre de sesión de usuarios.
 * Utiliza Laravel Sanctum para la autenticación basada en tokens.
 */
class AuthController extends Controller
{
    /**
     * Registrar un nuevo usuario
     * 
     * Proceso:
     * 1. Valida los datos del formulario de registro
     * 2. Crea el usuario con contraseña hasheada
     * 3. Maneja la asignación de equipos:
     *    - Supervisores pueden crear nuevos equipos
     *    - Empleados solo pueden unirse a equipos existentes
     * 4. Genera un token de autenticación
     * 
     * @param Request $request Datos del registro (name, email, password, role, team_name)
     * @return \Illuminate\Http\JsonResponse Usuario creado y token
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'nullable|in:employee,supervisor',
            'team_name' => 'nullable|string|max:80',
        ]);

        // Create user
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'role' => $request->role ?? 'employee',
        ]);

        // Handle team if provided
        if ($request->team_name) {
            $team = \App\Models\Team::where('name', $request->team_name)->first();

            // If team doesn't exist
            if (!$team) {
                // Supervisors can create new teams
                if ($user->role === 'supervisor') {
                    $team = \App\Models\Team::create([
                        'name' => $request->team_name,
                        'supervisor_user_id' => $user->id,
                        'active' => true,
                    ]);
                } else {
                    // Employees cannot create teams
                    $user->delete(); // Remove the created user
                    return response()->json([
                        'message' => 'Team validation failed',
                        'errors' => [
                            'team_name' => ['This team doesn\'t exist. Please contact your supervisor or try another team name.']
                        ]
                    ], 422);
                }
            } else {
                // Team exists - assign supervisor if needed
                if ($user->role === 'supervisor' && !$team->supervisor_user_id) {
                    $team->update(['supervisor_user_id' => $user->id]);
                }
            }

            $user->update(['team_id' => $team->id]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'User registered successfully',
            'user' => $user->load('team'),
            'token' => $token,
        ], 201);
    }

    /**
     * Login user and create token
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password_hash)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ], 200);
    }

    /**
     * Logout user (revoke current token)
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ], 200);
    }

    /**
     * Get authenticated user
     */
    public function me(Request $request)
    {
        return response()->json([
            'user' => $request->user(),
        ], 200);
    }
}
