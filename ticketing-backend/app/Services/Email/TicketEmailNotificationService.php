<?php

namespace App\Services\Email;

use App\Models\Approver;
use App\Models\Submission;
use App\Models\User;
use App\Services\Approval\ApprovalAuthorizationService;
use Illuminate\Support\Facades\Log;
use Throwable;

class TicketEmailNotificationService
{
    private const APP_NAME = 'HELPDESK';

    /**
     * Set to '' when ready to send emails to the actual intended recipients.
     */
    private const TEST_OVERRIDE_EMAIL = 'AZRIL.ATHALLAH@IBSMULTI.COM';

    public function __construct(
        private APIEmail_service $emailService,
        private ApprovalAuthorizationService $auth
    ) {}

    public function notify(
        Submission $submission,
        string $event,
        ?User $actor = null,
        ?string $notes = null
    ): void {
        try {
            $submission->loadMissing('requestor');

            $target = $this->resolveIntendedTarget($submission);
            $intendedRecipients = $target['emails'];
            $intendedRole = $target['role'];
            $intendedRoleLabel = $target['role_label'];

            $overrideEmail = trim(self::TEST_OVERRIDE_EMAIL);
            $isOverrideActive = $overrideEmail !== '';

            $actualRecipients = $isOverrideActive
                ? collect(explode(',', $overrideEmail))
                ->map(fn(string $email) => trim($email))
                ->filter()
                ->unique()
                ->values()
                ->all()
                : $intendedRecipients;

            if (empty($actualRecipients)) {
                Log::warning('Ticket email notification skipped: no recipient found.', [
                    'submission_id' => $submission->id,
                    'submission_number' => $submission->number,
                    'event' => $event,
                    'status' => $submission->status,
                ]);

                return;
            }

            $recipientName = $this->resolveRecipientName(
                $submission,
                $intendedRecipients,
                $intendedRoleLabel
            );

            $content = $this->buildContent($submission, $event, $intendedRole, $actor);

            $htmlBody = view('emails.ticket-notification', [
                'appName' => self::APP_NAME,
                'subjectLine' => $content['subject'],
                'recipientName' => $recipientName,
                'introMessage' => $content['intro'],
                'statusLabel' => $this->statusLabel($submission->status, $intendedRole),
                'submission' => $submission,
                'notes' => $notes,
                'isOverrideActive' => $isOverrideActive,
                'actualRecipients' => $actualRecipients,
                'intendedRecipients' => $intendedRecipients,
                'intendedRoleLabel' => $intendedRoleLabel,
            ])->render();

            $data = [
                'app_name' => self::APP_NAME,
                'email_to' => count($actualRecipients) === 1 ? $actualRecipients[0] : $actualRecipients,
                'email_subject' => $content['subject'],
                'email_body' => $htmlBody,
            ];

            $response = $this->emailService->posting_email($data);
            $dataRes = json_decode((string) $response, true);

            if (!is_array($dataRes) || ($dataRes['status'] ?? false) !== true) {
                Log::error('Failed to send ticket email notification.', [
                    'submission_id' => $submission->id,
                    'submission_number' => $submission->number,
                    'event' => $event,
                    'email_to' => $actualRecipients,
                    'intended_to' => $intendedRecipients,
                    'response' => $dataRes ?? $response,
                ]);
            }
        } catch (Throwable $e) {
            Log::error('Exception while sending ticket email notification.', [
                'submission_id' => $submission->id,
                'submission_number' => $submission->number,
                'event' => $event,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * @return array{emails: array<int, string>, role: ?string, role_label: string}
     */
    private function resolveIntendedTarget(Submission $submission): array
    {
        if (in_array($submission->status, [
            Submission::STATUS_TICKET_SOLVED,
            Submission::STATUS_TICKET_REJECTED,
            Submission::STATUS_REVISION_REQUESTOR,
        ], true)) {
            return [
                'emails' => $this->normalizeEmails([$submission->requestor?->email]),
                'role' => ApprovalAuthorizationService::ROLE_REQUESTOR,
                'role_label' => 'Requestor',
            ];
        }

        $stepInfo = $this->auth->requiredStepInfo($submission);

        if ($stepInfo === null) {
            return [
                'emails' => [],
                'role' => null,
                'role_label' => 'Team',
            ];
        }

        $role = $stepInfo['role'];

        if ($role === ApprovalAuthorizationService::ROLE_REQUESTOR) {
            return [
                'emails' => $this->normalizeEmails([$submission->requestor?->email]),
                'role' => $role,
                'role_label' => 'Requestor',
            ];
        }

        if ($role === ApprovalAuthorizationService::ROLE_DIV_HEAD) {
            return [
                'emails' => $this->normalizeEmails([$submission->requestor?->divhead]),
                'role' => $role,
                'role_label' => 'Division Head',
            ];
        }

        return [
            'emails' => $this->findActiveApproverEmails($submission, $role),
            'role' => $role,
            'role_label' => $this->roleLabel($role),
        ];
    }

    /**
     * @param  array<int, string>  $intendedRecipients
     */
    private function resolveRecipientName(
        Submission $submission,
        array $intendedRecipients,
        string $fallbackRoleLabel
    ): string {
        if ($fallbackRoleLabel === 'Requestor' && !empty($submission->requestor?->name)) {
            return trim((string) $submission->requestor->name);
        }

        if (empty($intendedRecipients)) {
            return $fallbackRoleLabel;
        }

        $lowerEmails = array_map('strtolower', $intendedRecipients);
        $placeholders = implode(', ', array_fill(0, count($lowerEmails), '?'));

        $names = User::query()
            ->whereRaw("LOWER(TRIM(email)) IN ({$placeholders})", $lowerEmails)
            ->pluck('name')
            ->map(fn($name) => trim((string) $name))
            ->filter()
            ->unique()
            ->values()
            ->all();

        return !empty($names) ? implode(', ', $names) : $fallbackRoleLabel;
    }

    /**
     * @return array<int, string>
     */
    private function findActiveApproverEmails(Submission $submission, string $role): array
    {
        $formKey = $this->auth->formKeyFor($submission);

        if ($formKey === '') {
            return [];
        }

        $today = now()->toDateString();
        $targetRole = strtoupper(trim($role));

        $entries = Approver::query()
            ->whereNotNull('start_date')
            ->whereNotNull('end_date')
            ->whereDate('start_date', '<=', $today)
            ->whereDate('end_date', '>=', $today)
            ->whereRaw('UPPER(TRIM(role)) = ?', [$targetRole])
            ->whereRaw('LOWER(TRIM(form_key)) IN (?, ?)', [$formKey, '*'])
            ->get();

        if ($formKey === 'support' && $targetRole === Approver::ROLE_PIC) {
            $ticketModule = strtoupper($this->auth->submissionSupportModule($submission));

            if ($ticketModule !== '') {
                $entries = $entries->filter(function (Approver $entry) use ($ticketModule) {
                    $entryModule = strtoupper(trim((string) ($entry->module ?? '')));

                    return $entryModule === $ticketModule || $entryModule === '*';
                });
            }
        }

        return $this->normalizeEmails($entries->pluck('email')->all());
    }

    /**
     * @param  array<int, mixed>  $emails
     * @return array<int, string>
     */
    private function normalizeEmails(array $emails): array
    {
        return collect($emails)
            ->map(fn($email) => trim((string) $email))
            ->filter(fn(string $email) => $email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL))
            ->unique(fn(string $email) => strtolower($email))
            ->values()
            ->all();
    }

    /**
     * @return array{subject: string, intro: string}
     */
    private function buildContent(
        Submission $submission,
        string $event,
        ?string $nextRole,
        ?User $actor
    ): array {
        $number = $submission->number;
        $actorName = $actor?->name ?: 'User';

        if ($event === 'resolved') {
            return [
                'subject' => '[HELPDESK] - Ticket Resolved',
                'intro' => "Your ticket {$number} has been resolved by {$actorName}.",
            ];
        }

        if ($event === 'rejected') {
            return [
                'subject' => '[HELPDESK] - Ticket Rejected',
                'intro' => "Your ticket {$number} has been rejected by {$actorName}. Please review the rejection reason below.",
            ];
        }

        if ($event === 'revised') {
            $intro = match ($nextRole) {
                Approver::ROLE_ACCOUNTING_STAFF => "Ticket {$number} has been returned by {$actorName} for revision. Please update and resubmit the Accounting data based on the notes below.",
                Approver::ROLE_TAX_STAFF => "Ticket {$number} has been returned by {$actorName} for revision. Please update and resubmit the Tax data based on the notes below.",
                Approver::ROLE_PIC => "The Change Request Form for ticket {$number} has been returned by {$actorName} for revision. Please update and resubmit it based on the notes below.",
                default => "Your ticket {$number} has been returned by {$actorName} for revision. Please update the submission and resubmit it based on the notes below.",
            };

            return [
                'subject' => '[HELPDESK] - Revision Required',
                'intro' => $intro,
            ];
        }

        if ($event === 'cr_submitted') {
            return [
                'subject' => '[HELPDESK] - Change Request Approval',
                'intro' => "{$actorName} has submitted a Change Request Form for ticket {$number}. Please review and approve it so the request can proceed.",
            ];
        }

        if ($event === 'module_assigned') {
            return [
                'subject' => '[HELPDESK] - Ticket Assigned',
                'intro' => "Ticket {$number} has been assigned to your module by {$actorName}. Please review and process this ticket.",
            ];
        }

        return match ($nextRole) {
            Approver::ROLE_ACCOUNTING_STAFF => [
                'subject' => '[HELPDESK] - Accounting Data Required',
                'intro' => "Ticket {$number} requires your action. Please complete and submit the Accounting data so the request can proceed to the next approval stage.",
            ],
            Approver::ROLE_TAX_STAFF => [
                'subject' => '[HELPDESK] - Tax Data Required',
                'intro' => "Ticket {$number} requires your action. Please complete and submit the Tax data so the request can proceed to the next approval stage.",
            ],
            Approver::ROLE_PIC => [
                'subject' => '[HELPDESK] - Action Required',
                'intro' => "Ticket {$number} is ready for processing. Please review and resolve this ticket in the system.",
            ],
            default => [
                'subject' => '[HELPDESK] - Approval Request',
                'intro' => $event === 'resubmitted'
                    ? "Ticket {$number} has been revised and resubmitted by {$actorName}. Please review and approve this request."
                    : "Ticket {$number} requires your approval. Please review the details below and approve or return this request in the system.",
            ],
        };
    }

    private function roleLabel(string $role): string
    {
        return match (strtoupper(trim($role))) {
            ApprovalAuthorizationService::ROLE_REQUESTOR => 'Requestor',
            ApprovalAuthorizationService::ROLE_DIV_HEAD => 'Division Head',
            Approver::ROLE_ACC_DEPT_HEAD => 'Accounting Department Head',
            Approver::ROLE_ACCOUNTING_STAFF => 'Accounting Staff',
            Approver::ROLE_ACCOUNTING_HEAD => 'Accounting Head',
            Approver::ROLE_TAX_STAFF => 'Tax Staff',
            Approver::ROLE_TAX_HEAD => 'Tax Head',
            Approver::ROLE_IT_SAP_HEAD => 'IT-SAP Head',
            Approver::ROLE_PIC => 'PIC',
            default => $role,
        };
    }

    private function statusLabel(string $status, ?string $nextRole): string
    {
        return match ($status) {
            Submission::STATUS_TICKET_SOLVED => 'Solved',
            Submission::STATUS_TICKET_REJECTED => 'Rejected',
            Submission::STATUS_TICKET_CANCELLED => 'Cancelled',
            Submission::STATUS_REVISION_REQUESTOR,
            Submission::STATUS_REVISION_ACCOUNTING,
            Submission::STATUS_REVISION_TAX,
            Submission::STATUS_REVISION_PIC => 'Needs Revision',
            Submission::STATUS_REVIEW_REQUESTOR => 'Needs Approval',
            default => match ($nextRole) {
                ApprovalAuthorizationService::ROLE_DIV_HEAD => 'Review Division Head',
                Approver::ROLE_ACC_DEPT_HEAD => 'Review Accounting Dept Head',
                Approver::ROLE_ACCOUNTING_STAFF => 'Needs Accounting Data',
                Approver::ROLE_ACCOUNTING_HEAD => 'Review Accounting Head',
                Approver::ROLE_TAX_STAFF => 'Needs Tax Data',
                Approver::ROLE_TAX_HEAD => 'Review Tax Head',
                Approver::ROLE_IT_SAP_HEAD => 'Review IT-SAP Head',
                Approver::ROLE_PIC => 'Waiting PIC',
                default => ucwords(strtolower(str_replace('_', ' ', $status))),
            },
        };
    }
}
