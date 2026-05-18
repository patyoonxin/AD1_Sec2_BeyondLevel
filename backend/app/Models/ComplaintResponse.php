<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * Represents a single admin reply on a complaint thread.
 *
 * Each Complaint may have many ComplaintResponse rows, allowing admins
 * to append additional responses over time without overwriting earlier ones.
 */
class ComplaintResponse extends Model
{
    protected $fillable = [
        'complaint_id',
        'admin_id',
        'message',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * The complaint this response belongs to.
     */
    public function complaint(): BelongsTo
    {
        return $this->belongsTo(Complaint::class);
    }

    /**
     * The admin user who authored this response.
     */
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_id');
    }
}
