<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Approver extends Model
{
    public const ROLE_ACC_DEPT_HEAD = 'ACC_DEPT_HEAD';
    public const ROLE_ACCOUNTING_STAFF = 'ACCOUNTING_STAFF';
    public const ROLE_ACCOUNTING_HEAD = 'ACCOUNTING_HEAD';
    public const ROLE_TAX_STAFF = 'TAX_STAFF';
    public const ROLE_TAX_HEAD = 'TAX_HEAD';
    public const ROLE_IT_SAP_HEAD = 'IT_SAP_HEAD';
    public const ROLE_PIC = 'PIC';

    public $timestamps = false;

    protected $fillable = [
        'form_key',
        'module',
        'role',
        'nik',
        'email',
        'start_date',
        'end_date',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date:Y-m-d',
            'end_date' => 'date:Y-m-d',
        ];
    }
}
