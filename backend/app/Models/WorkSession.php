<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkSession extends Model
{
    protected $fillable = [
        'user_id',
        'clock_in',
        'clock_out',
        'total_minutes',
        'status',
        'notes'
    ];

    protected $casts = [
        'clock_in' => 'datetime',
        'clock_out' => 'datetime',
    ];

    /**
     * Get the user that owns the work session
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the breaks for the work session
     */
    public function breaks()
    {
        return $this->hasMany(WorkBreak::class);
    }

    /**
     * Calculate total minutes worked
     */
    public function calculateTotalMinutes()
    {
        if ($this->clock_out) {
            $this->total_minutes = $this->clock_in->diffInMinutes($this->clock_out);
            $this->save();
        }
    }

    /**
     * Check if session is active
     */
    public function isActive()
    {
        return $this->status === 'in_progress';
    }

    /**
     * Clock out
     */
    public function clockOut()
    {
        $this->clock_out = now();
        $this->status = 'completed';
        $this->calculateTotalMinutes();
        $this->save();
    }
}
