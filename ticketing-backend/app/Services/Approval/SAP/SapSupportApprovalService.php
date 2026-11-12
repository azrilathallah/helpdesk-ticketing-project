<?php

namespace App\Services\Approval\SAP;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Services\Approval\ApprovalQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SapSupportApprovalService
{
    public function __construct(private ApprovalQueryService $query) {}

    protected function allowedResolveStatuses(): array
    {
        return [
            Submission::STATUS_WAITING_PIC,
            Submission::STATUS_APPROVED_IT_SAP_HEAD,
        ];
    }

    public function submitCr(Request $request, Submission $submission)
    {
        if (!in_array($submission->status, [
            Submission::STATUS_WAITING_PIC,
            Submission::STATUS_REVISION_PIC,
        ], true)) {
            return response()->json([
                'message' => 'The request is not in the correct status to submit a Change Request Form.'
            ], 422);
        }

        $request->validate([
            'cr_data' => 'required|array',
            'cr_data.title' => 'required|string|max:255',
            'cr_data.targetDate' => 'required|string|max:50',
            'cr_data.crNumber' => 'required|string|max:100',
            'cr_data.sapFunctional' => 'nullable|string|max:150',
            'cr_data.implication' => 'required|string|max:50',
            'cr_data.priority' => 'required|string|max:50',
            'cr_data.currentProcess' => 'required|string',
            'cr_data.expectedProcess' => 'required|string',
            'cr_data.benefit' => 'required|string',
            'notes' => 'nullable|string|max:1000',
        ]);

        $crData = $request->input('cr_data');
        $crData['sapFunctional'] = trim((string) ($crData['sapFunctional'] ?? '')) ?: $request->user()->name;

        DB::transaction(function () use ($request, $submission, $crData) {
            $formData = $submission->form_data ?? [];
            $requestDate = !empty($formData['crData']['requestDate'])
                ? $formData['crData']['requestDate']
                : now()->toDateString();

            $crData['requestDate'] = $requestDate;

            $formData['needCrForm'] = 'Yes';
            $formData['hasCrForm'] = true;
            $formData['crData'] = array_merge($formData['crData'] ?? [], $crData, [
                'requestDate' => $requestDate,
                'sapFunctional' => $crData['sapFunctional'],
            ]);

            $submission->form_data = $formData;
            $submission->status = Submission::STATUS_REVIEW_REQUESTOR;
            $submission->save();

            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'PIC_SUBMIT_CR',
                'action' => 'SUBMITTED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'step_data' => $crData,
                'created_at' => now(),
            ]);
        });

        return $this->query->responseFor(
            $submission,
            'Change Request Form was successfully submitted.'
        );
    }

    public function approveRequestor(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_REVIEW_REQUESTOR) {
            return response()->json([
                'message' => 'The request is not in the correct status to be approved by the Requestor.'
            ], 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $submission) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'REQUESTOR_APPROVE',
                'action' => 'APPROVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_APPROVED_REQUESTOR;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'The Change Request was successfully approved by the Requestor.'
        );
    }

    public function approveDivHead(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_APPROVED_REQUESTOR) {
            return response()->json([
                'message' => 'The request is not in the correct status to be approved by the Division Head.'
            ], 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
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
            'The Change Request was successfully approved by the Division Head.'
        );
    }

    public function approveITSapHead(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_APPROVED_DIV_HEAD) {
            return response()->json([
                'message' => 'The request is not in the correct status to be approved by the IT-SAP Head.'
            ], 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $submission) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'IT_SAP_HEAD_APPROVE',
                'action' => 'APPROVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_APPROVED_IT_SAP_HEAD;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'The Change Request was successfully approved by the IT-SAP Head.'
        );
    }

    public function resolve(Request $request, Submission $submission)
    {
        if (!in_array($submission->status, $this->allowedResolveStatuses(), true)) {
            return response()->json([
                'message' => 'The request is not in the PIC processing stage.'
            ], 422);
        }

        $solution = trim((string) ($request->input('solution') ?? $request->input('notes') ?? ''));

        if ($solution === '') {
            return response()->json([
                'message' => 'The solution explanation is required to resolve the ticket.'
            ], 422);
        }

        DB::transaction(function () use ($request, $submission, $solution) {
            $formData = $submission->form_data ?? [];
            $formData['solution'] = $solution;
            $formData['needCrForm'] = !empty($formData['hasCrForm']) ? 'Yes' : 'No';
            $submission->form_data = $formData;

            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'PIC_PROCESS',
                'action' => 'SOLVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'step_data' => [
                    'solution' => $solution,
                ],
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_TICKET_SOLVED;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'The request was successfully resolved.'
        );
    }

    public function reject(Request $request, Submission $submission)
    {
        if (!in_array($submission->status, [
            Submission::STATUS_WAITING_PIC,
            Submission::STATUS_REVIEW_REQUESTOR,
            Submission::STATUS_APPROVED_REQUESTOR,
            Submission::STATUS_APPROVED_DIV_HEAD,
        ], true)) {
            return response()->json([
                'message' => 'The request cannot be rejected at this stage.'
            ], 422);
        }

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
            'The request was successfully rejected.'
        );
    }

    public function revise(Request $request, Submission $submission)
    {
        $request->validate(
            ['notes' => 'required|string|min:1|max:1000'],
            ['notes.required' => 'Revision notes is required.']
        );

        $flowMap = [
            Submission::STATUS_REVIEW_REQUESTOR => [
                'next_status' => Submission::STATUS_REVISION_PIC,
                'step' => 'REQUESTOR_REVISION',
                'message' => 'The Change Request has been returned to the SAP PIC for revision.'
            ],
            Submission::STATUS_APPROVED_REQUESTOR => [
                'next_status' => Submission::STATUS_REVISION_PIC,
                'step' => 'DIV_HEAD_REVISION',
                'message' => 'The Change Request has been returned to the SAP PIC for revision.'
            ],
            Submission::STATUS_APPROVED_DIV_HEAD => [
                'next_status' => Submission::STATUS_REVISION_PIC,
                'step' => 'IT_SAP_HEAD_REVISION',
                'message' => 'The Change Request has been returned to the SAP PIC for revision.'
            ],
        ];

        $flow = $flowMap[$submission->status] ?? null;

        if (!$flow) {
            return response()->json([
                'message' => 'No revisions can be made to this request status.'
            ], 422);
        }

        DB::transaction(function () use ($request, $submission, $flow) {
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
