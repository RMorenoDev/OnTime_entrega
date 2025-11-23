<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * WorkBreak - Modelo de Pausa
 * Representa pausas durante la jornada laboral.
 * Relaciones: pertenece a WorkSession.
 */
class WorkBreak extends Model
{
    protected $table = 'breaks';
    
    protected $fillable = [
        'work_session_id',
        'break_type',
        'is_paid',
        'started_at',
        'ended_at',
        'note',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'is_paid' => 'boolean',
    ];

    /** Sesion de trabajo a la que pertenece la pausa. */
    public function workSession()
    {
        return $this->belongsTo(WorkSession::class);
    }
}
