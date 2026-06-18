<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Complaint extends Model
{
    /** @use HasFactory<\Database\Factories\ComplaintFactory> */
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'record_id',
        'user_id',
        'title',
        'category',
        'category_id',
        'description',
        'location',
        'attachments',
        'admin_response',
        'status',
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            /*
            |--------------------------------------------------------------------------
            | Attachment Casting
            |--------------------------------------------------------------------------
            | Automatically encodes/decodes the JSON array of file paths
            | so it can be treated as a PHP array in the application.
            */
            'attachments' => 'array',

            /*
            |--------------------------------------------------------------------------
            | Timestamp Casting
            |--------------------------------------------------------------------------
            | Ensures created_at and updated_at are returned as Carbon instances.
            */
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    /**
     * Get the user who submitted this complaint.
     *
     * Defines an inverse one-to-many relationship with the User model.
     *
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the dynamic category associated with this complaint.
     *
     * @return BelongsTo<ComplaintCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ComplaintCategory::class, 'category_id');
    }

    /**
     * The chronological thread of admin responses on this complaint.
     *
     * Ordered oldest-first so the UI can render them top-to-bottom
     * naturally. Each response includes the admin who wrote it.
     */
    public function responses(): HasMany
    {
        return $this->hasMany(ComplaintResponse::class)->orderBy('created_at', 'asc');
    }
}
