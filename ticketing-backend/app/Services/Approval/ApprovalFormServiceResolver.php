<?php

namespace App\Services\Approval;

use App\Models\Submission;
use App\Services\Approval\SAP\CustomerApprovalService;
use App\Services\Approval\SAP\GLApprovalService;
use App\Services\Approval\SAP\MaterialApprovalService;
use App\Services\Approval\SAP\VendorApprovalService;
use App\Services\Approval\SAP\UserIdApprovalService;
use App\Services\Approval\SAP\CostProfitApprovalService;
use App\Services\Approval\SAP\SapSupportApprovalService;

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
