<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * User - Modelo de Usuario
 * Representa usuarios del sistema (admin, supervisor, employee)
 * Relaciones: pertenece a Team, tiene muchas WorkSessions y LeaveRequests
 */
class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Atributos asignables de forma masiva.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'role',
        'team_id',
        'active',
    ];

    /**
     * Atributos que deben ocultarse al serializar.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password_hash',
        'remember_token',
    ];

    /** Obtener la contrasena para autenticacion. */
    public function getAuthPassword()
    {
        return $this->password_hash;
    }

    /**
     * Atributos que se deben castear.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'active' => 'boolean',
        ];
    }

    /** Equipo al que pertenece el usuario. */
    public function team()
    {
        return $this->belongsTo(Team::class);
    }

    /** Todas las sesiones de trabajo del usuario. */
    public function workSessions()
    {
        return $this->hasMany(WorkSession::class);
    }

    /** Todas las solicitudes de permiso del usuario. */
    public function leaveRequests()
    {
        return $this->hasMany(LeaveRequest::class);
    }

    /** Verifica si el usuario es empleado. */
    public function isEmployee()
    {
        return $this->role === 'employee';
    }

    /** Verifica si el usuario es supervisor. */
    public function isSupervisor()
    {
        return $this->role === 'supervisor';
    }

    /** Verifica si el usuario es admin. */
    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}
