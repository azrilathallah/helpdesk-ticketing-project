<?php

namespace App\Services\Approval;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Models\User;
use App\Services\SubmissionAttachmentService;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Auth;

class ApprovalQueryService
{
    public function __construct(private ApprovalAuthorizationService $auth) {}

    public function index()
    {
        /** @var User|null $user */
        $user = Auth::user();

        if (!$user) {
            return response()->json(['data' => []]);
        }

        $approverEntries = $this->auth->activeApproverEntriesFor($user);

        $submissions = Submission::query()
            ->with(['requestor', 'approvals'])
            ->where(function ($query) use ($user) {
                $query->whereIn('status', Submission::activeStatuses())
                    ->orWhereHas('approvals', function ($approvalQuery) use ($user) {
                        $approvalQuery->where('acted_by', $user->id)
                            ->whereNotIn('step', ApprovalAuthorizationService::REQUESTOR_NON_APPROVAL_STEPS);
                    });
            })
            ->latest()
            ->get()
            ->filter(
                fn(Submission $submission) =>
                $this->auth->canAct($user, $submission, $approverEntries)
                    || $this->auth->hasActed($user, $submission)
            )
            ->values()
            ->map(
                fn(Submission $submission) =>
                $this->transform($submission, false, $user, $approverEntries)
            );

        return response()->json(['data' => $submissions]);
    }

    public function show(Submission $submission)
    {
        /** @var User|null $user */
        $user = Auth::user();

        $submission->load(['requestor', 'approvals.actor']);

        abort_unless(
            $user && $this->auth->canView($user, $submission),
            403,
            'You do not have access to this approval request.'
        );

        return response()->json(['data' => $this->transform($submission, true, $user)]);
    }

    public function transform(
        Submission $submission,
        bool $detail = false,
        ?User $user = null,
        ?Collection $approverEntries = null
    ): array {
        /** @var User|null $currentUser */
        $currentUser = $user ?? Auth::user();

        $canAct = $currentUser
            ? $this->auth->canAct($currentUser, $submission, $approverEntries)
            : false;
        $stepInfo = $canAct ? $this->auth->requiredStepInfo($submission) : null;

        $data = [
            'id' => $submission->id,
            'number' => $submission->number,
            'type' => $submission->type,
            'category' => $submission->category,
            'sub_category' => $submission->sub_category,
            'form_type' => $submission->form_type,
            'status' => $submission->status,
            'can_act' => $canAct,
            'approval_role' => $canAct ? ($stepInfo['frontend_role'] ?? null) : null,
            'created_at' => $submission->created_at,
            'updated_at' => $submission->updated_at,
            'requestor' => [
                'id' => $submission->requestor_id,
                'name' => $submission->requestor?->name,
                'nik' => $submission->requestor?->nik,
                'email' => $submission->requestor?->email,
                'position' => $submission->requestor?->position,
                'division' => $submission->requestor?->division,
                'department' => $submission->requestor?->department,
                'telephone' => $submission->requestor?->telephone,
            ],
        ];

        if ($detail) {
            $data['form_data'] = $submission->form_data;
            $data['attachments'] = SubmissionAttachmentService::present($submission, 'approvals');
            $data['approval_history'] = $submission->approvals
                ->map(fn(SubmissionApproval $approval) => [
                    'id' => $approval->id,
                    'step' => $approval->step,
                    'action' => $approval->action,
                    'notes' => $approval->notes,
                    'step_data' => $approval->step_data,
                    'actor' => [
                        'id' => $approval->acted_by,
                        'name' => $approval->actor?->name,
                        'email' => $approval->actor?->email,
                    ],
                    'created_at' => $approval->created_at,
                ])
                ->values()
                ->all();
        }

        return $data;
    }

    public function responseFor(Submission $submission, string $message)
    {
        return response()->json([
            'message' => $message,
            'data' => $this->transform(
                $submission->fresh(['requestor', 'approvals.actor']),
                true
            ),
        ]);
    }
}
