<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LeaveRequest extends Model
{
    protected $fillable = [
        'user_id',
        'supervisor_id',
        'type',
        'start_date',
        'end_date',
        'reason',
        'status',
        'approved_at',
        'rejected_at',
        'notes'
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'approved_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * Get the user that made the request
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the supervisor
     */
    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_id');
    }

    /**
     * Approve the request
     */
    public function approve()
    {
        $this->status = 'approved';
        $this->approved_at = now();
        $this->save();
    }

    /**
     * Reject the request
     */
    public function reject()
    {
        $this->status = 'rejected';
        $this->rejected_at = now();
        $this->save();
    }

    /**
     * Cancel the request
     */
    public function cancel()
    {
        $this->status = 'cancelled';
        $this->save();
    }
}
