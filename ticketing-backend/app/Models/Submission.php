<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Submission extends Model
{
    use HasFactory;

    const STATUS_DRAFT = 'DRAFT';
    const STATUS_REVIEW_DIV_HEAD = 'REVIEW_DIV_HEAD';
    const STATUS_APPROVED_DIV_HEAD = 'APPROVED_DIV_HEAD';
    const STATUS_REVIEW_ACCOUNTING = 'REVIEW_ACCOUNTING';
    const STATUS_APPROVED_ACCOUNTING = 'APPROVED_ACCOUNTING';
    const STATUS_REVIEW_TAX = 'REVIEW_TAX';
    const STATUS_APPROVED_TAX = 'APPROVED_TAX';
    const STATUS_WAITING_PIC = 'WAITING_PIC';
    const STATUS_TICKET_SOLVED = 'TICKET_SOLVED';
    const STATUS_TICKET_CANCELLED = 'TICKET_CANCELLED';
    const STATUS_TICKET_REJECTED = 'TICKET_REJECTED';

    /**
     * Urutan flow status.
     */
    const STATUS_FLOW = [
        self::STATUS_REVIEW_DIV_HEAD,
        self::STATUS_APPROVED_DIV_HEAD,
        self::STATUS_REVIEW_ACCOUNTING,
        self::STATUS_APPROVED_ACCOUNTING,
        self::STATUS_REVIEW_TAX,
        self::STATUS_APPROVED_TAX,
        self::STATUS_WAITING_PIC,
        self::STATUS_TICKET_SOLVED,
    ];

    protected $fillable = [
        'requestor_id',
        'number',
        'type',
        'category',
        'sub_category',
        'form_type',
        'status',
        'form_data',
        'attachments',
        'submitted_at',
    ];

    protected function casts(): array
    {
        return [
            'form_data' => 'array',
            'attachments' => 'array',
            'submitted_at' => 'datetime',
        ];
    }

    public function requestor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requestor_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(SubmissionApproval::class)
            ->orderBy('created_at', 'asc');
    }

    public function isEditableByRequestor(): bool
    {
        return $this->status === self::STATUS_DRAFT;
    }

    public static function activeStatuses(): array
    {
        return [
            self::STATUS_REVIEW_DIV_HEAD,
            self::STATUS_APPROVED_DIV_HEAD,
            self::STATUS_REVIEW_ACCOUNTING,
            self::STATUS_APPROVED_ACCOUNTING,
            self::STATUS_REVIEW_TAX,
            self::STATUS_APPROVED_TAX,
            self::STATUS_WAITING_PIC,
        ];
    }
}
