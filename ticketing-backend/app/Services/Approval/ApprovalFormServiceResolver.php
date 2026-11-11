<?php

namespace App\Services\Approval;

use App\Models\Submission;
use App\Services\Approval\Forms\CustomerApprovalService;
use App\Services\Approval\Forms\GLApprovalService;
use App\Services\Approval\Forms\MaterialApprovalService;
use App\Services\Approval\Forms\VendorApprovalService;
use App\Services\Approval\Forms\UserIdApprovalService;
use App\Services\Approval\Forms\CostProfitApprovalService;
use App\Services\Approval\Forms\SapSupportApprovalService;

class ApprovalFormServiceResolver
{
    public static function for(Submission $submission): CustomerApprovalService|
    VendorApprovalService|
    MaterialApprovalService|
    GLApprovalService|
    UserIdApprovalService|
    CostProfitApprovalService|
    SapSupportApprovalService|
    null
    {
        if (strtolower(trim((string) $submission->category)) === 'support') {
            return app(SapSupportApprovalService::class);
        }

        return match (strtolower(trim((string) $submission->sub_category))) {
            'customer' => app(CustomerApprovalService::class),
            'vendor' => app(VendorApprovalService::class),
            'material' => app(MaterialApprovalService::class),
            'gl' => app(GLApprovalService::class),
            'user id' => app(UserIdApprovalService::class),
            'cost center and profit center' => app(CostProfitApprovalService::class),
            default => null,
        };
    }
}
