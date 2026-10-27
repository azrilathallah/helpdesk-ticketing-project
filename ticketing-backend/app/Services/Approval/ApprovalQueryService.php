<?php

namespace App\Services\Approval;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use Illuminate\Http\Request;

class ApprovalQueryService
{
    public function index()
    {
        $submissions = Submission::query()
            ->with('requestor')
            ->whereIn('status', Submission::activeStatuses())
            ->latest()
            ->get()
            ->map(fn(Submission $submission) => $this->transform($submission));

        return response()->json(['data' => $submissions]);
    }

    public function show(Submission $submission)
    {
        $submission->load(['requestor', 'approvals.actor']);

        return response()->json(['data' => $this->transform($submission, true)]);
    }

    public function transform(Submission $submission, bool $detail = false): array
    {
        $data = [
            'id' => $submission->id,
            'number' => $submission->number,
            'type' => $submission->type,
            'category' => $submission->category,
            'sub_category' => $submission->sub_category,
            'form_type' => $submission->form_type,
            'status' => $submission->status,
            'created_at' => $submission->created_at,
            'updated_at' => $submission->updated_at,
            'requestor' => [
                'id' => $submission->requestor_id,
                'name' => $submission->requestor?->name,
                'email' => $submission->requestor?->email,
                'position' => $submission->requestor?->position,
                'division' => $submission->requestor?->division,
                'department' => $submission->requestor?->department,
                'telephone' => $submission->requestor?->telephone,
            ],
        ];

        if ($detail) {
            $data['form_data'] = $submission->form_data;
            $data['attachments'] = $submission->attachments ?? [];
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
