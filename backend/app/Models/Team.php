<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Team - Modelo de Equipo
 * Representa grupos de trabajo con un supervisor.
 * Relaciones: tiene muchos Users (members), pertenece a User (supervisor).
 */
class Team extends Model
{
    protected $fillable = ['name', 'supervisor_user_id', 'active'];

    protected $casts = [
        'active' => 'boolean',
    ];

    /** Obtener el supervisor del equipo. */
    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_user_id');
    }

    /** Obtener todos los miembros del equipo. */
    public function members()
    {
        return $this->hasMany(User::class, 'team_id');
    }
}
