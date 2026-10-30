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
    const STATUS_REVIEW_ACC_DEPT_HEAD = 'REVIEW_ACC_DEPT_HEAD';
    const STATUS_APPROVED_ACC_DEPT_HEAD = 'APPROVED_ACC_DEPT_HEAD';
    const STATUS_REVIEW_DIV_HEAD = 'REVIEW_DIV_HEAD';
    const STATUS_APPROVED_DIV_HEAD = 'APPROVED_DIV_HEAD';
    const STATUS_REVIEW_ACCOUNTING_HEAD = 'REVIEW_ACCOUNTING_HEAD';
    const STATUS_APPROVED_ACCOUNTING_HEAD = 'APPROVED_ACCOUNTING_HEAD';
    const STATUS_REVIEW_TAX_HEAD = 'REVIEW_TAX_HEAD';
    const STATUS_APPROVED_TAX_HEAD = 'APPROVED_TAX_HEAD';
    const STATUS_WAITING_PIC = 'WAITING_PIC';
    const STATUS_TICKET_SOLVED = 'TICKET_SOLVED';
    const STATUS_TICKET_CANCELLED = 'TICKET_CANCELLED';
    const STATUS_TICKET_REJECTED = 'TICKET_REJECTED';
    const STATUS_REVISION_REQUESTOR = 'REVISION_REQUESTOR';
    const STATUS_REVISION_ACCOUNTING = 'REVISION_ACCOUNTING';
    const STATUS_REVISION_TAX = 'REVISION_TAX';

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
    ];

    protected function casts(): array
    {
        return [
            'form_data' => 'array',
            'attachments' => 'array',
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
        return in_array($this->status, [
            self::STATUS_DRAFT,
            self::STATUS_REVISION_REQUESTOR,
        ], true);
    }

    /**
     * Status awal saat requestor submit, berdasarkan sub category form.
     * GL dimulai dari Accounting Department Head, form lain dari Division Head.
     */
    public static function initialStatusFor(?string $subCategory): string
    {
        return strtolower(trim((string) $subCategory)) === 'gl'
            ? self::STATUS_REVIEW_ACC_DEPT_HEAD
            : self::STATUS_REVIEW_DIV_HEAD;
    }

    /**
     * Step approval history untuk status awal.
     */
    public static function initialStepFor(?string $subCategory): string
    {
        return self::initialStatusFor($subCategory) === self::STATUS_REVIEW_ACC_DEPT_HEAD
            ? 'ACC_DEPT_HEAD_REVIEW'
            : 'DIV_HEAD_REVIEW';
    }

    public static function activeStatuses(): array
    {
        return [
            self::STATUS_REVIEW_ACC_DEPT_HEAD,
            self::STATUS_APPROVED_ACC_DEPT_HEAD,
            self::STATUS_REVIEW_DIV_HEAD,
            self::STATUS_APPROVED_DIV_HEAD,
            self::STATUS_REVIEW_ACCOUNTING_HEAD,
            self::STATUS_APPROVED_ACCOUNTING_HEAD,
            self::STATUS_REVIEW_TAX_HEAD,
            self::STATUS_APPROVED_TAX_HEAD,
            self::STATUS_WAITING_PIC,
            self::STATUS_REVISION_REQUESTOR,
            self::STATUS_REVISION_ACCOUNTING,
            self::STATUS_REVISION_TAX,
        ];
    }
}
