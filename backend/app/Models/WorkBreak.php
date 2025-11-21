<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WorkBreak extends Model
{
    protected $table = 'breaks';
    
    protected $fillable = [
        'work_session_id',
        'type',
        'start_time',
        'end_time',
        'duration_minutes'
    ];

    protected $casts = [
        'start_time' => 'datetime',
        'end_time' => 'datetime',
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
