<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * LeaveRequest - Modelo de Solicitud de Permiso
 * Representa solicitudes de vacaciones, permisos médicos y personales
 * Relaciones: pertenece a User (empleado) y User (supervisor que aprueba)
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

    /**
     * Get the employee who requested leave
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Get the supervisor who reviewed the request
     */
    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    /**
     * Check if request is pending
     */
    public function isPending()
    {
        return $this->status === 'pending';
    }

    /**
     * Check if request is approved
     */
    public function isApproved()
    {
        return $this->status === 'approved';
    }

    /**
     * Check if request is rejected
     */
    public function isRejected()
    {
        return $this->status === 'rejected';
    }

    /**
     * Check if request is cancelled
     */
    public function isCancelled()
    {
        return $this->status === 'cancelled';
    }

    /**
     * Get duration in days (for full day requests)
     */
    public function getDurationInDays()
    {
        if (!$this->is_full_day || !$this->end_at) {
            return 0;
        }
        
        return $this->start_at->diffInDays($this->end_at) + 1; // +1 to include both start and end day
    }

    /**
     * Get formatted duration string
     */
    public function getFormattedDuration()
    {
        if ($this->is_full_day) {
            $days = $this->getDurationInDays();
            return $days . ' ' . ($days === 1 ? 'day' : 'days');
        }
        
        return $this->duration_hours . ' hours';
    }
}
