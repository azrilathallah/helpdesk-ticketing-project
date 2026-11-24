<?php

namespace App\Http\Controllers;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\View\View;

class SignatureVerificationController extends Controller
{
    /**
     * @var array<string, array{steps: list<string>, actions: list<string>, fallback_requestor?: bool}>
     */
    private const ROLE_MAP = [
        'requestor' => [
            'steps' => ['REQUESTOR_SUBMIT', 'REQUESTOR_RESUBMIT'],
            'actions' => ['SUBMITTED', 'RESUBMITTED'],
            'fallback_requestor' => true,
        ],
        'cr_requestor' => [
            'steps' => ['REQUESTOR_APPROVE', 'REQUESTOR_SUBMIT', 'REQUESTOR_RESUBMIT'],
            'actions' => ['APPROVED', 'SUBMITTED', 'RESUBMITTED'],
            'fallback_requestor' => true,
        ],
        'acc_dept_head' => [
            'steps' => ['ACC_DEPT_HEAD_APPROVE'],
            'actions' => ['APPROVED'],
        ],
        'div_head' => [
            'steps' => ['DIV_HEAD_APPROVE'],
            'actions' => ['APPROVED'],
        ],
        'accounting' => [
            'steps' => ['ACCOUNTING_HEAD_APPROVE'],
            'actions' => ['APPROVED'],
        ],
        'tax' => [
            'steps' => ['TAX_HEAD_APPROVE'],
            'actions' => ['APPROVED'],
        ],
        'it_sap_head' => [
            'steps' => ['IT_SAP_HEAD_APPROVE'],
            'actions' => ['APPROVED'],
        ],
        'pic' => [
            'steps' => ['PIC_PROCESS'],
            'actions' => ['SOLVED'],
        ],
    ];

    public function show(Request $request, Submission $submission, string $role): View
    {
        $logoBase64 = $this->resolveLogoBase64();

        if (!$request->hasValidRelativeSignature()) {
            return $this->invalidView(
                $logoBase64,
                'This digital signature is invalid or the verification link has been tampered with.'
            );
        }

        $roleConfig = self::ROLE_MAP[$role] ?? null;
        if ($roleConfig === null) {
            return $this->invalidView($logoBase64, 'Unrecognized signer role.');
        }

        $submission->loadMissing(['requestor', 'approvals.actor']);

        $approvalId = $request->query('approval');
        $approval = null;

        if ($approvalId !== null && $approvalId !== '') {
            $approval = $submission->approvals
                ->first(fn(SubmissionApproval $item) => (string) $item->id === (string) $approvalId);

            if (
                $approval === null
                || !in_array($approval->step, $roleConfig['steps'], true)
                || !in_array($approval->action, $roleConfig['actions'], true)
            ) {
                return $this->invalidView(
                    $logoBase64,
                    'Approval record not found or does not match this document.'
                );
            }
        } else {
            $approval = $submission->approvals
                ->filter(fn(SubmissionApproval $item) => in_array($item->step, $roleConfig['steps'], true) && in_array($item->action, $roleConfig['actions'], true))
                ->last();
        }

        /** @var User|null $signer */
        $signer = $approval?->actor;
        $signedAt = $approval?->created_at;

        if ($signer === null && !empty($roleConfig['fallback_requestor']) && $submission->requestor) {
            $signer = $submission->requestor;
            $signedAt = $signedAt ?? $submission->created_at;
        }

        if ($signer === null) {
            return $this->invalidView(
                $logoBase64,
                'Signer information is not available for this approval stage.'
            );
        }

        $signedAtFormatted = $signedAt
            ? Carbon::parse($signedAt)->timezone('Asia/Jakarta')->format('d F Y, H:i') . ' WIB'
            : '-';

        $formType = implode(' - ', array_filter(
            [$submission->type, $submission->category, $submission->sub_category],
            fn($value) => is_string($value) && trim($value) !== ''
        )) ?: '-';

        return view('signature.verify', [
            'isValid' => true,
            'logoBase64' => $logoBase64,
            'signer' => [
                'name' => $signer->name ?? '-',
                'nik' => $signer->nik ?? '-',
                'position' => $signer->position ?? '-',
                'division' => $signer->division ?? '-',
                'department' => $signer->department ?? '-',
                'email' => $signer->email ?? '-',
            ],
            'document' => [
                'number' => $submission->number ?? '-',
                'form_type' => $formType,
                'signed_at' => $signedAtFormatted,
            ],
        ]);
    }

    private function invalidView(?string $logoBase64, string $message): View
    {
        return view('signature.verify', [
            'isValid' => false,
            'logoBase64' => $logoBase64,
            'errorMessage' => $message,
        ]);
    }

    private function resolveLogoBase64(): ?string
    {
        $logoPath = public_path('icon/IBS.png');

        return is_file($logoPath)
            ? 'data:image/png;base64,' . base64_encode((string) file_get_contents($logoPath))
            : null;
    }
}
