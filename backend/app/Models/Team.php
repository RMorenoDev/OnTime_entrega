<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Team extends Model
{
    protected $fillable = ['name', 'supervisor_user_id', 'active'];

    protected $casts = [
        'active' => 'boolean',
    ];

    /**
     * Get the supervisor of the team
     */
    public function supervisor()
    {
        return $this->belongsTo(User::class, 'supervisor_user_id');
    }

    /**
     * Get all members of the team
     */
    public function members()
    {
        return $this->hasMany(User::class, 'team_id');
    }
}
