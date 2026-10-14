<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SubmissionApproval extends Model
{
    protected $fillable = [
        'submission_id',
        'step',
        'action',
        'acted_by',
        'notes',
        'step_data',
    ];

    protected function casts(): array
    {
        return [
            'step_data' => 'array',
        ];
    }

    public function submission(): BelongsTo
    {
        return $this->belongsTo(Submission::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'acted_by');
    }
}
