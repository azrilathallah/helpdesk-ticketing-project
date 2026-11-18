<?php

namespace App\Services\Approval;

use App\Models\Approver;
use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Models\User;
use Illuminate\Support\Collection;

class ApprovalAuthorizationService
{
    public const ROLE_REQUESTOR = 'REQUESTOR';
    public const ROLE_DIV_HEAD = 'DIV_HEAD';

    public const REQUESTOR_NON_APPROVAL_STEPS = [
        'REQUESTOR_SUBMIT',
        'REQUESTOR_RESUBMIT',
        'REQUESTOR_CANCEL',
        'REQUESTOR_APPROVE',
        'REQUESTOR_REVISION',
    ];

    public function formKeyFor(Submission $submission): string
    {
        if (strtolower(trim((string) $submission->category)) === 'support') {
            return 'support';
        }

        return strtolower(trim((string) $submission->sub_category));
    }

    /**
     * @return array{role: string, frontend_role: string}|null
     */
    public function requiredStepInfo(Submission $submission): ?array
    {
        $formKey = $this->formKeyFor($submission);
        $status = $submission->status;

        if ($formKey === 'support') {
            return match ($status) {
                Submission::STATUS_WAITING_PIC,
                Submission::STATUS_REVISION_PIC,
                Submission::STATUS_APPROVED_IT_SAP_HEAD => [
                    'role' => Approver::ROLE_PIC,
                    'frontend_role' => 'pic',
                ],
                Submission::STATUS_REVIEW_REQUESTOR => [
                    'role' => self::ROLE_REQUESTOR,
                    'frontend_role' => 'requestor',
                ],
                Submission::STATUS_APPROVED_REQUESTOR,
                Submission::STATUS_REVIEW_DIV_HEAD => [
                    'role' => self::ROLE_DIV_HEAD,
                    'frontend_role' => 'division_head',
                ],
                Submission::STATUS_APPROVED_DIV_HEAD,
                Submission::STATUS_REVIEW_IT_SAP_HEAD => [
                    'role' => Approver::ROLE_IT_SAP_HEAD,
                    'frontend_role' => 'it_sap_head',
                ],
                default => null,
            };
        }

        return match ($formKey) {
            'customer', 'vendor' => match ($status) {
                Submission::STATUS_REVIEW_DIV_HEAD => [
                    'role' => self::ROLE_DIV_HEAD,
                    'frontend_role' => 'division_head',
                ],
                Submission::STATUS_APPROVED_DIV_HEAD,
                Submission::STATUS_REVISION_ACCOUNTING => [
                    'role' => Approver::ROLE_ACCOUNTING_STAFF,
                    'frontend_role' => 'accounting',
                ],
                Submission::STATUS_REVIEW_ACCOUNTING_HEAD => [
                    'role' => Approver::ROLE_ACCOUNTING_HEAD,
                    'frontend_role' => 'accounting_head',
                ],
                Submission::STATUS_APPROVED_ACCOUNTING_HEAD,
                Submission::STATUS_REVISION_TAX => [
                    'role' => Approver::ROLE_TAX_STAFF,
                    'frontend_role' => 'tax',
                ],
                Submission::STATUS_REVIEW_TAX_HEAD => [
                    'role' => Approver::ROLE_TAX_HEAD,
                    'frontend_role' => 'tax_head',
                ],
                Submission::STATUS_APPROVED_TAX_HEAD,
                Submission::STATUS_WAITING_PIC => [
                    'role' => Approver::ROLE_PIC,
                    'frontend_role' => 'pic',
                ],
                default => null,
            },
            'material' => $this->requiredMaterialStepInfo($submission),
            'gl' => match ($status) {
                Submission::STATUS_REVIEW_ACC_DEPT_HEAD => [
                    'role' => Approver::ROLE_ACC_DEPT_HEAD,
                    'frontend_role' => 'accounting_dept_head',
                ],
                Submission::STATUS_APPROVED_ACC_DEPT_HEAD => [
                    'role' => Approver::ROLE_ACCOUNTING_HEAD,
                    'frontend_role' => 'accounting',
                ],
                Submission::STATUS_APPROVED_ACCOUNTING_HEAD => [
                    'role' => self::ROLE_DIV_HEAD,
                    'frontend_role' => 'division_head',
                ],
                Submission::STATUS_APPROVED_DIV_HEAD,
                Submission::STATUS_WAITING_PIC => [
                    'role' => Approver::ROLE_PIC,
                    'frontend_role' => 'pic',
                ],
                default => null,
            },
            'user id', 'cost center and profit center' => match ($status) {
                Submission::STATUS_REVIEW_DIV_HEAD => [
                    'role' => self::ROLE_DIV_HEAD,
                    'frontend_role' => 'division_head',
                ],
                Submission::STATUS_APPROVED_DIV_HEAD,
                Submission::STATUS_WAITING_PIC => [
                    'role' => Approver::ROLE_PIC,
                    'frontend_role' => 'pic',
                ],
                default => null,
            },
            'wbs' => match ($status) {
                Submission::STATUS_WAITING_PIC => [
                    'role' => Approver::ROLE_PIC,
                    'frontend_role' => 'pic',
                ],
                default => null,
            },
            default => null,
        };
    }

    /**
     * @return array{role: string, frontend_role: string}|null
     */
    private function requiredMaterialStepInfo(Submission $submission): ?array
    {
        $materialType = strtoupper(
            trim((string) (($submission->form_data ?? [])['materialType'] ?? ''))
        );

        return match ($submission->status) {
            Submission::STATUS_REVIEW_DIV_HEAD => [
                'role' => self::ROLE_DIV_HEAD,
                'frontend_role' => 'division_head',
            ],
            Submission::STATUS_APPROVED_DIV_HEAD => in_array($materialType, ['YPRO', 'ZCOM'], true)
                ? [
                    'role' => Approver::ROLE_ACCOUNTING_STAFF,
                    'frontend_role' => 'accounting',
                ]
                : [
                    'role' => Approver::ROLE_PIC,
                    'frontend_role' => 'pic',
                ],
            Submission::STATUS_REVISION_ACCOUNTING => [
                'role' => Approver::ROLE_ACCOUNTING_STAFF,
                'frontend_role' => 'accounting',
            ],
            Submission::STATUS_REVIEW_ACCOUNTING_HEAD => [
                'role' => Approver::ROLE_ACCOUNTING_HEAD,
                'frontend_role' => 'accounting_head',
            ],
            Submission::STATUS_APPROVED_ACCOUNTING_HEAD,
            Submission::STATUS_WAITING_PIC => [
                'role' => Approver::ROLE_PIC,
                'frontend_role' => 'pic',
            ],
            default => null,
        };
    }

    public function activeApproverEntriesFor(User $user): Collection
    {
        $nik = strtoupper(trim((string) ($user->nik ?? '')));
        $email = strtoupper(trim((string) ($user->email ?? '')));

        if ($nik === '' || $email === '') {
            return collect();
        }

        $today = now()->toDateString();

        return Approver::query()
            ->whereNotNull('start_date')
            ->whereNotNull('end_date')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->whereRaw('UPPER(TRIM(nik)) = ?', [$nik])
            ->whereRaw('UPPER(TRIM(email)) = ?', [$email])
            ->get();
    }

    public function userHasRoleForSubmission(
        User $user,
        Submission $submission,
        string $role,
        ?Collection $preloadedApproverEntries = null
    ): bool {
        if ($role === self::ROLE_REQUESTOR) {
            return (int) $submission->requestor_id === (int) $user->id;
        }

        if ($role === self::ROLE_DIV_HEAD) {
            $submission->loadMissing('requestor');
            $requestorDivHead = strtolower(trim((string) ($submission->requestor?->divhead ?? '')));
            $userEmail = strtolower(trim((string) ($user->email ?? '')));

            return $requestorDivHead !== ''
                && $userEmail !== ''
                && $requestorDivHead === $userEmail;
        }

        $formKey = $this->formKeyFor($submission);

        if ($formKey === '') {
            return false;
        }

        $entries = $preloadedApproverEntries ?? $this->activeApproverEntriesFor($user);
        $targetRole = strtoupper(trim($role));

        return $entries->contains(function (Approver $entry) use ($formKey, $targetRole) {
            $entryFormKey = strtolower(trim((string) $entry->form_key));
            $entryRole = strtoupper(trim((string) $entry->role));

            return $entryRole === $targetRole
                && in_array($entryFormKey, [$formKey, '*'], true);
        });
    }

    public function canAct(
        User $user,
        Submission $submission,
        ?Collection $preloadedApproverEntries = null
    ): bool {
        $stepInfo = $this->requiredStepInfo($submission);

        if ($stepInfo === null) {
            return false;
        }

        return $this->userHasRoleForSubmission(
            $user,
            $submission,
            $stepInfo['role'],
            $preloadedApproverEntries
        );
    }

    public function hasActed(User $user, Submission $submission): bool
    {
        if ($submission->relationLoaded('approvals')) {
            return $submission->approvals->contains(function (SubmissionApproval $approval) use ($user) {
                return (int) $approval->acted_by === (int) $user->id
                    && !in_array($approval->step, self::REQUESTOR_NON_APPROVAL_STEPS, true);
            });
        }

        return $submission->approvals()
            ->where('acted_by', $user->id)
            ->whereNotIn('step', self::REQUESTOR_NON_APPROVAL_STEPS)
            ->exists();
    }

    public function canView(
        User $user,
        Submission $submission,
        ?Collection $preloadedApproverEntries = null
    ): bool {
        return $this->canAct($user, $submission, $preloadedApproverEntries)
            || $this->hasActed($user, $submission);
    }

    public function authorizeAction(
        User $user,
        Submission $submission,
        ?string $expectedRole = null
    ): void {
        $stepInfo = $this->requiredStepInfo($submission);

        if ($stepInfo === null) {
            if ($expectedRole !== null) {
                if (!$this->userHasRoleForSubmission($user, $submission, $expectedRole)) {
                    abort(403, 'You are not authorized to process this approval step.');
                }
            } elseif (!$this->canView($user, $submission)) {
                abort(403, 'You are not authorized to process this approval step.');
            }

            return;
        }

        if ($expectedRole !== null && $stepInfo['role'] !== $expectedRole) {
            if (!$this->userHasRoleForSubmission($user, $submission, $expectedRole)) {
                abort(403, 'You are not authorized to process this approval step.');
            }

            abort(422, 'The request is not in the correct status for this action.');
        }

        if (!$this->userHasRoleForSubmission($user, $submission, $stepInfo['role'])) {
            abort(403, 'You are not authorized to process this approval step.');
        }
    }
}
