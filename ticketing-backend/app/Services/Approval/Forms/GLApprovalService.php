<?php

namespace App\Services\Approval\Forms;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Services\Approval\ApprovalQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GLApprovalService
{
    public function __construct(private ApprovalQueryService $query) {}

    protected function allowedResolveStatuses(): array
    {
        return [Submission::STATUS_APPROVED_DIV_HEAD];
    }

    public function approveAccDeptHead(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_REVIEW_ACC_DEPT_HEAD) {
            return response()->json([
                'message' => 'The request is not in the "Review by Accounting Dept Head" status.'
            ], 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000'
        ]);

        DB::transaction(function () use ($request, $submission) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'ACC_DEPT_HEAD_APPROVE',
                'action' => 'APPROVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_APPROVED_ACC_DEPT_HEAD;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'The request was successfully approved by the Accounting Department Head.'
        );
    }

    public function approveAccountingHead(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_APPROVED_ACC_DEPT_HEAD) {
            return response()->json([
                'message' => 'The request is not in the "Review by Accounting Head" status.'
            ], 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000'
        ]);

        DB::transaction(function () use ($request, $submission) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'ACCOUNTING_HEAD_APPROVE',
                'action' => 'APPROVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_APPROVED_ACCOUNTING_HEAD;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'The request was successfully approved by the Accounting Head.'
        );
    }

    public function approveDivHead(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_APPROVED_ACCOUNTING_HEAD) {
            return response()->json([
                'message' => 'The request is not in the correct status to be approved by the Division Head.'
            ], 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000'
        ]);

        DB::transaction(function () use ($request, $submission) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'DIV_HEAD_APPROVE',
                'action' => 'APPROVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_APPROVED_DIV_HEAD;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'The request was successfully approved by the Division Head.'
        );
    }

    public function resolve(Request $request, Submission $submission)
    {
        if (!in_array($submission->status, $this->allowedResolveStatuses(), true))
            return response()->json([
                'message' => 'The request is not in the PIC processing stage.'
            ], 422);

        $request->validate([
            'notes' => 'nullable|string|max:1000'
        ]);

        DB::transaction(function () use ($request, $submission) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'PIC_PROCESS',
                'action' => 'SOLVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'step_data' => null,
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_TICKET_SOLVED;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'The request was succesfully resolved.'
        );
    }

    public function reject(Request $request, Submission $submission)
    {
        if (!in_array($submission->status, [
            Submission::STATUS_REVIEW_ACC_DEPT_HEAD,
            Submission::STATUS_APPROVED_ACC_DEPT_HEAD,
            Submission::STATUS_APPROVED_ACCOUNTING_HEAD,
        ], true))
            return response()->json([
                'message' => 'The request cannot be rejected at this stage.'
            ], 422);

        $request->validate(
            ['notes' => 'required|string|max:1000'],
            ['notes.required' => 'Reason for rejection is required.']
        );

        DB::transaction(function () use ($request, $submission) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => $submission->status,
                'action' => 'REJECTED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_TICKET_REJECTED;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'The request was succesfully rejected.'
        );
    }

    public function revise(Request $request, Submission $submission)
    {
        $request->validate(
            ['notes' => 'required|string|min:1|max:1000'],
            ['notes.required' => 'Revision notes is required.']
        );

        if ($submission->status !== Submission::STATUS_REVIEW_ACC_DEPT_HEAD) {
            return response()->json([
                'message' => 'Revision can only be given by Accounting Department Head.'
            ], 422);
        }

        $flow = [
            'next_status' => Submission::STATUS_REVISION_REQUESTOR,
            'step' => 'ACC_DEPT_HEAD_REVISION',
            'message' => 'The request has been returned to the Requester for revision.'
        ];

        DB::transaction(function () use (
            $request,
            $submission,
            $flow
        ) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => $flow['step'],
                'action' => 'REVISION_REQUESTED',
                'acted_by' => $request->user()->id,
                'notes' => trim($request->input('notes')),
                'created_at' => now(),
            ]);

            $submission->status = $flow['next_status'];
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            $flow['message']
        );
    }
}
