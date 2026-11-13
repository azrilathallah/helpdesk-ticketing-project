<?php

namespace App\Services\Approval\SAP;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Services\Approval\ApprovalQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class WbsApprovalService
{
    public function __construct(private ApprovalQueryService $query) {}

    public function resolve(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_WAITING_PIC) {
            return response()->json([
                'message' => 'The request is not in the PIC processing stage.'
            ], 422);
        }

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
            'The request was successfully resolved.'
        );
    }
}

