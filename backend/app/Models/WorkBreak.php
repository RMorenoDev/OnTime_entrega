<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

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

    /**
     * Get the work session that owns the break
     */
    public function workSession()
    {
        return $this->belongsTo(WorkSession::class);
    }

    /**
     * Calculate duration
     */
    public function calculateDuration()
    {
        if ($this->end_time) {
            $this->duration_minutes = $this->start_time->diffInMinutes($this->end_time);
            $this->save();
        }
    }

    /**
     * End the break
     */
    public function end()
    {
        $this->end_time = now();
        $this->calculateDuration();
        $this->save();
    }
}
