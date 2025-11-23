<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * LeaveRequest - Modelo de Solicitud de Permiso
 * Representa solicitudes de vacaciones, permisos medicos y personales.
 * Relaciones: pertenece a User (empleado) y User (supervisor que aprueba).
 */
class LeaveRequest extends Model
{
    protected $fillable = [
        'user_id',
        'supervisor_id',
        'leave_type',
        'is_paid',
        'is_full_day',
        'duration_hours',
        'start_at',
        'end_at',
        'status',
        'reviewed_at',
        'note',
        'rejection_reason',
    ];

    protected $casts = [
        'start_at' => 'datetime',
        'end_at' => 'datetime',
        'reviewed_at' => 'datetime',
        'is_paid' => 'boolean',
        'is_full_day' => 'boolean',
        'duration_hours' => 'decimal:1',
    ];

    /** Obtener el empleado que solicito el permiso. */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /** Obtener el supervisor que reviso la solicitud. */
    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    /** Verifica si la solicitud esta pendiente. */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /** Verifica si la solicitud esta aprobada. */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /** Verifica si la solicitud esta rechazada. */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    /** Verifica si la solicitud esta cancelada. */
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /** Duracion en dias (para solicitudes de dia completo). */
    public function getDurationInDays()
    {
        if (!$this->is_full_day || !$this->end_at) {
            return 0;
        }
        
        return $this->start_at->diffInDays($this->end_at) + 1; // +1 para incluir dia inicial y final
    }

    /** Devuelve la duracion formateada en texto. */
    public function getFormattedDuration()
    {
        if ($this->is_full_day) {
            $days = $this->getDurationInDays();
            return $days . ' ' . ($days === 1 ? 'day' : 'days');
        }
        
        return $this->duration_hours . ' hours';
    }
}
