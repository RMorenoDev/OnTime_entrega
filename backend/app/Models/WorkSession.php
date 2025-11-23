<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * WorkSession - Modelo de Sesion de Trabajo
 * Representa una jornada laboral (clock-in hasta clock-out).
 * Relaciones: pertenece a User y tiene muchas WorkBreaks (pausas).
 */
class WorkSession extends Model
{
    protected $fillable = [
        'user_id',
        'started_at',
        'ended_at',
        'source',
        'note',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
    ];

    /** Usuario al que pertenece la sesion de trabajo. */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /** Pausas asociadas a la sesion de trabajo. */
    public function breaks()
    {
        return $this->hasMany(WorkBreak::class);
    }

    /** Calcula minutos totales trabajados. */
    public function calculateTotalMinutes()
    {
        if ($this->clock_out) {
            $this->total_minutes = $this->clock_in->diffInMinutes($this->clock_out);
            $this->save();
        }
    }

    /** Verifica si la sesion esta activa. */
    public function isActive()
    {
        return $this->status === 'in_progress';
    }

    /** Realiza clock-out de la sesion. */
    public function clockOut()
    {
        $this->clock_out = now();
        $this->status = 'completed';
        $this->calculateTotalMinutes();
        $this->save();
    }
}
