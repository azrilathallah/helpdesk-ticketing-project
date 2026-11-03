<?php

namespace App\Services\Approval;

use App\Models\Submission;
use App\Services\Approval\Forms\CustomerApprovalService;
use App\Services\Approval\Forms\GLApprovalService;
use App\Services\Approval\Forms\MaterialApprovalService;
use App\Services\Approval\Forms\VendorApprovalService;
use App\Services\Approval\Forms\UserIdApprovalService;

class ApprovalFormServiceResolver
{
    public static function for(Submission $submission): CustomerApprovalService|VendorApprovalService|MaterialApprovalService|GLApprovalService|UserIdApprovalService|null
    {
        return match (strtolower(trim((string) $submission->sub_category))) {
            'customer' => app(CustomerApprovalService::class),
            'vendor' => app(VendorApprovalService::class),
            'material' => app(MaterialApprovalService::class),
            'gl' => app(GLApprovalService::class),
            'user id' => app(UserIdApprovalService::class),
            default => null,
        };
    }
}
