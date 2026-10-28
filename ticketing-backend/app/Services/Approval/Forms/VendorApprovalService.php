<?php

namespace App\Services\Approval\Forms;

use App\Models\Submission;
use App\Models\SubmissionApproval;
use App\Services\Approval\ApprovalQueryService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VendorApprovalService
{
    public function __construct(private ApprovalQueryService $query) {}

    protected function accountingRules(Submission $submission): array
    {
        return [
            'accounting_data' => 'required|array',
            'accounting_data.accountGroup' => 'required|string',
            'accounting_data.reconAccount' => 'required|string',
            'accounting_data.paymentMethod' => 'required|array|min:1',
            'accounting_data.paymentMethod.*' => 'required|string',
            'notes' => 'nullable|string|max:1000'
        ];
    }

    protected function resolveCodeFields(): array
    {
        return [
            'request' => 'vendor_code',
            'form' => 'vendorCode'
        ];
    }

    protected function allowedResolveStatuses(): array
    {
        return [Submission::STATUS_APPROVED_TAX_HEAD];
    }

    protected function accountingError(Submission $submission): ?string
    {
        return null;
    }

    public function approveDivHead(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_REVIEW_DIV_HEAD) {
            return response()->json([
                'message' => 'Submission tidak dalam status yang tepat untuk di-approve oleh Division Head.'
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
            'Submission berhasil di-approve oleh Division Head.'
        );
    }

    public function fillAccounting(Request $request, Submission $submission)
    {
        if (!in_array($submission->status, [
            Submission::STATUS_APPROVED_DIV_HEAD,
            Submission::STATUS_REVISION_ACCOUNTING
        ], true)) {
            return response()->json([
                'message' => 'Submission tidak berada pada tahap pengisian Accounting.'
            ], 422);
        }

        $rules = $this->accountingRules($submission);

        if (!$rules) {
            return response()->json([
                'message' => 'Form ini tidak memiliki tahap pengisian Accounting.'
            ], 422);
        }

        $request->validate($rules);
        $accountingData = $request->input('accounting_data');
        $wasRevision = $submission->status === Submission::STATUS_REVISION_ACCOUNTING;

        DB::transaction(function () use (
            $request,
            $submission,
            $accountingData,
            $wasRevision
        ) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => $wasRevision ? 'ACCOUNTING_REFILLED' : 'ACCOUNTING_FILL',
                'action' => $wasRevision ? 'REFILLED' : 'FILLED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'step_data' => $accountingData,
                'created_at' => now(),
            ]);

            $submission->form_data = array_merge(
                $submission->form_data ?? [],
                $accountingData
            );
            $submission->status = Submission::STATUS_REVIEW_ACCOUNTING_HEAD;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'Data accounting berhasil disimpan.'
        );
    }

    public function approveAccountingHead(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_REVIEW_ACCOUNTING_HEAD) {
            return response()->json([
                'message' => 'Submission tidak dalam status Review by Accounting.'
            ], 422);
        }

        $hasFill = $submission->approvals()
            ->whereIn('step', ['ACCOUNTING_FILL', 'ACCOUNTING_REFILLED'])
            ->whereIn('action', ['FILLED', 'REFILLED'])
            ->exists();

        if (!$hasFill)
            return response()->json([
                'message' => 'Accounting Staff belum mengisi data. Tidak dapat di-approve.'
            ], 422);

        $error = $this->accountingError($submission);

        if ($error !== null)
            return response()->json([
                'message' => $error
            ], 422);

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
            'Submission berhasil di-approve oleh Accounting Head.'
        );
    }

    public function fillTax(Request $request, Submission $submission)
    {
        if (!in_array($submission->status, [
            Submission::STATUS_APPROVED_ACCOUNTING_HEAD,
            Submission::STATUS_REVISION_TAX
        ], true)) {
            return response()->json([
                'message' => 'Submission belum berada pada tahap pengisian Tax.'
            ], 422);
        }

        $request->validate([
            'tax_data' => 'required|array',
            'tax_data.witholdingTax' => 'required|array',
            'notes' => 'nullable|string|max:1000'
        ]);
        $taxData = $request->input('tax_data');
        $wasRevision = $submission->status === Submission::STATUS_REVISION_TAX;

        DB::transaction(function () use (
            $request,
            $submission,
            $taxData,
            $wasRevision
        ) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => $wasRevision ? 'TAX_REFILLED' : 'TAX_FILL',
                'action' => $wasRevision ? 'REFILLED' : 'FILLED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'step_data' => $taxData,
                'created_at' => now(),
            ]);

            $submission->form_data = array_merge(
                $submission->form_data ?? [],
                $taxData
            );
            $submission->status = Submission::STATUS_REVIEW_TAX_HEAD;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'Data tax berhasil disimpan.'
        );
    }

    public function approveTaxHead(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_REVIEW_TAX_HEAD)
            return response()->json([
                'message' => 'Submission tidak dalam status Review by Tax.'
            ], 422);

        $hasFill = $submission->approvals()
            ->whereIn('step', ['TAX_FILL', 'TAX_REFILLED'])
            ->whereIn('action', ['FILLED', 'REFILLED'])
            ->exists();

        if (!$hasFill)
            return response()->json([
                'message' => 'Tax Staff belum mengisi data. Tidak dapat di-approve.'
            ], 422);

        $request->validate([
            'notes' => 'nullable|string|max:1000'
        ]);

        DB::transaction(function () use ($request, $submission) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'TAX_APPROVE',
                'action' => 'APPROVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_APPROVED_TAX_HEAD;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'Submission berhasil di-approve oleh Tax Head dan diteruskan ke PIC.'
        );
    }

    public function resolve(Request $request, Submission $submission)
    {
        if (!in_array($submission->status, $this->allowedResolveStatuses(), true))
            return response()->json([
                'message' => 'Submission belum berada pada tahap penyelesaian PIC.'
            ], 422);

        $formData = $submission->form_data ?? [];
        $isNew = ($formData['requestType'] ?? '') === 'New';
        $fields = $this->resolveCodeFields();
        $rules = ['notes' => 'nullable|string|max:1000'];

        if ($isNew)
            $rules[$fields['request']] = 'required|string|max:50';

        $request->validate($rules);

        DB::transaction(function () use (
            $request,
            $submission,
            $isNew,
            $fields
        ) {
            $stepData = [];
            if ($isNew) {
                $code = trim((string) $request->input($fields['request']));
                $stepData[$fields['form']] = $code;
                $data = $submission->form_data ?? [];
                $data[$fields['form']] = $code;
                $submission->form_data = $data;
            }
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'PIC_PROCESS',
                'action' => 'SOLVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'step_data' => $stepData ?: null,
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_TICKET_SOLVED;
            $submission->save();
        });

        return $this->query->responseFor(
            $submission,
            'Ticket berhasil diselesaikan.'
        );
    }

    public function reject(Request $request, Submission $submission)
    {
        if (!in_array($submission->status, [
            Submission::STATUS_REVIEW_DIV_HEAD,
            Submission::STATUS_REVIEW_ACCOUNTING_HEAD,
            Submission::STATUS_REVIEW_TAX_HEAD
        ], true))
            return response()->json([
                'message' => 'Submission tidak dapat di-reject pada tahap ini.'
            ], 422);

        $request->validate(
            ['notes' => 'required|string|max:1000'],
            ['notes.required' => 'Catatan alasan reject wajib diisi.']
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
            'Submission berhasil di-reject.'
        );
    }

    public function revise(Request $request, Submission $submission)
    {
        $request->validate(
            ['notes' => 'required|string|min:1|max:1000'],
            ['notes.required' => 'Catatan revisi wajib diisi.']
        );

        $flowMap = [
            Submission::STATUS_REVIEW_DIV_HEAD => [
                'next_status' => Submission::STATUS_REVISION_REQUESTOR,
                'step' => 'DIV_HEAD_REVISION',
                'message' => 'Tiket dikembalikan kepada Requestor untuk direvisi.'
            ],
            Submission::STATUS_REVIEW_ACCOUNTING_HEAD => [
                'next_status' => Submission::STATUS_REVISION_ACCOUNTING,
                'step' => 'ACCOUNTING_REVISION',
                'message' => 'Tiket dikembalikan kepada Accounting Staff untuk direvisi.'
            ],
            Submission::STATUS_REVIEW_TAX_HEAD => [
                'next_status' => Submission::STATUS_REVISION_TAX,
                'step' => 'TAX_REVISION',
                'message' => 'Tiket dikembalikan kepada Tax Staff untuk direvisi.'
            ],
        ];

        $flow = $flowMap[$submission->status] ?? null;

        if (!$flow)
            return response()->json([
                'message' => 'Revisi tidak dapat dilakukan pada status tiket ini.'
            ], 422);

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
