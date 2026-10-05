<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Models\SubmissionApproval;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApprovalController extends Controller
{
    /**
     * GET /approvals
     *
     * Mengambil semua submission yang sedang
     * dalam proses approval (belum SOLVED/CANCELLED/DRAFT).
     *
     * Untuk testing: semua user bisa melihat
     * semua submission yang perlu di-approve.
     */
    public function index(Request $request)
    {
        $submissions = Submission::query()
            ->with('requestor')
            ->whereIn('status', Submission::activeStatuses())
            ->latest()
            ->get()
            ->map(fn(Submission $s) => $this->transform($s));

        return response()->json([
            'data' => $submissions,
        ]);
    }

    /**
     * GET /approvals/{submission}
     *
     * Detail submission + approval history.
     */
    public function show(Request $request, Submission $submission)
    {
        $submission->load(['requestor', 'approvals.actor']);

        return response()->json([
            'data' => $this->transform($submission, true),
        ]);
    }

    /**
     * POST /approvals/{submission}/approve-divhead
     *
     * Division Head meng-approve submission.
     *
     * Status: SUBMITTED → APPROVED_DIV_HEAD
     * Lalu otomatis maju ke REVIEW_ACCOUNTING
     */
    public function approveDivHead(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_REVIEW_DIV_HEAD) {
            return response()->json([
                'message' => 'Submission tidak dalam status yang tepat untuk di-approve oleh Div Head.',
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

            /*
             * Setelah Div Head approve,
             * status langsung ke REVIEW_ACCOUNTING
             * (menunggu Accounting Staff mengisi data).
             */
            $submission->status = Submission::STATUS_APPROVED_DIV_HEAD;
            $submission->save();
        });

        return response()->json([
            'message' => 'Submission berhasil di-approve oleh Division Head.',
            'data' => $this->transform($submission->fresh(['requestor', 'approvals.actor']), true),
        ]);
    }

    /**
     * POST /approvals/{submission}/fill-accounting
     *
     * Accounting Staff mengisi data accounting.
     *
     * Status: REVIEW_ACCOUNTING → REVIEW_ACCOUNTING
     * (tetap, menunggu Accounting Head approve)
     */
    public function fillAccounting(
        Request $request,
        Submission $submission
    ) {
        if (
            $submission->status !==
            Submission::STATUS_APPROVED_DIV_HEAD
        ) {
            return response()->json([
                'message' =>
                'Submission belum disetujui oleh Division Head.',
            ], 422);
        }

        $request->validate([
            'accounting_data' => 'required|array',
            'accounting_data.accountGroup' => 'required|string',
            'accounting_data.recontAccount' => 'required|string',
            'accounting_data.sortKey' => 'required|string',
            'accounting_data.toleranceGroup' => 'required|string',

            'notes' => 'nullable|string|max:1000',
        ]);

        $accountingData =
            $request->input('accounting_data');

        DB::transaction(function () use (
            $request,
            $submission,
            $accountingData
        ) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'ACCOUNTING_FILL',
                'action' => 'FILLED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'step_data' => $accountingData,
                'created_at' => now(),
            ]);

            /*
         * Merge accounting data
         * ke form_data.
         */
            $formData =
                $submission->form_data ?? [];

            $formData = array_merge(
                $formData,
                $accountingData
            );

            $submission->form_data = $formData;

            /*
         * Setelah Accounting Staff SAVE,
         * status berubah menjadi
         * REVIEW_ACCOUNTING.
         */
            $submission->status =
                Submission::STATUS_REVIEW_ACCOUNTING;

            $submission->save();
        });

        return response()->json([
            'message' =>
            'Data accounting berhasil disimpan. ' .
                'Menunggu approval Accounting Head.',

            'data' => $this->transform(
                $submission->fresh([
                    'requestor',
                    'approvals.actor',
                ]),
                true
            ),
        ]);
    }

    /**
     * POST /approvals/{submission}/approve-accounting
     *
     * Accounting Head meng-approve.
     *
     * Status: REVIEW_ACCOUNTING → APPROVED_ACCOUNTING
     * Lalu otomatis maju ke REVIEW_TAX
     */
    public function approveAccounting(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_REVIEW_ACCOUNTING) {
            return response()->json([
                'message' => 'Submission tidak dalam status Review by Accounting.',
            ], 422);
        }

        /*
         * Pastikan Accounting Staff sudah mengisi data
         * sebelum Head boleh approve.
         */
        $hasAccountingFill = $submission->approvals()
            ->where('step', 'ACCOUNTING_FILL')
            ->where('action', 'FILLED')
            ->exists();

        if (!$hasAccountingFill) {
            return response()->json([
                'message' => 'Accounting Staff belum mengisi data. Tidak dapat di-approve.',
            ], 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $submission) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'ACCOUNTING_APPROVE',
                'action' => 'APPROVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'created_at' => now(),
            ]);

            /*
             * Setelah Accounting Head approve,
             * status maju ke REVIEW_TAX.
             */
            $submission->status = Submission::STATUS_APPROVED_ACCOUNTING;
            $submission->save();
        });

        return response()->json([
            'message' => 'Submission berhasil di-approve oleh Accounting Head.',
            'data' => $this->transform($submission->fresh(['requestor', 'approvals.actor']), true),
        ]);
    }

    /**
     * POST /approvals/{submission}/fill-tax
     *
     * Tax Staff mengisi data tax.
     *
     * Status: REVIEW_TAX → REVIEW_TAX
     * (tetap, menunggu Tax Head approve)
     */
    public function fillTax(
        Request $request,
        Submission $submission
    ) {
        if (
            $submission->status !==
            Submission::STATUS_APPROVED_ACCOUNTING
        ) {
            return response()->json([
                'message' =>
                'Submission belum disetujui oleh Accounting Head.',
            ], 422);
        }

        $request->validate([
            'tax_data' => 'required|array',
            'tax_data.witholdingTax' => 'required|array',
            'notes' => 'nullable|string|max:1000',
        ]);

        $taxData =
            $request->input('tax_data');

        DB::transaction(function () use (
            $request,
            $submission,
            $taxData
        ) {
            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'TAX_FILL',
                'action' => 'FILLED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'step_data' => $taxData,
                'created_at' => now(),
            ]);

            /*
         * Merge tax data ke form_data.
         */
            $formData =
                $submission->form_data ?? [];

            $formData = array_merge(
                $formData,
                $taxData
            );

            $submission->form_data = $formData;

            /*
         * Setelah Tax Staff SAVE,
         * status menjadi REVIEW_TAX.
         */
            $submission->status =
                Submission::STATUS_REVIEW_TAX;

            $submission->save();
        });

        return response()->json([
            'message' =>
            'Data tax berhasil disimpan. ' .
                'Menunggu approval Tax Head.',

            'data' => $this->transform(
                $submission->fresh([
                    'requestor',
                    'approvals.actor',
                ]),
                true
            ),
        ]);
    }

    /**
     * POST /approvals/{submission}/approve-tax
     *
     * Tax Head meng-approve.
     *
     * Status: REVIEW_TAX → APPROVED_TAX
     * Lalu otomatis maju ke WAITING_PIC
     */
    public function approveTax(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_REVIEW_TAX) {
            return response()->json([
                'message' => 'Submission tidak dalam status Review by Tax.',
            ], 422);
        }

        /*
         * Pastikan Tax Staff sudah mengisi data.
         */
        $hasTaxFill = $submission->approvals()
            ->where('step', 'TAX_FILL')
            ->where('action', 'FILLED')
            ->exists();

        if (!$hasTaxFill) {
            return response()->json([
                'message' => 'Tax Staff belum mengisi data. Tidak dapat di-approve.',
            ], 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
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

            /*
             * Setelah Tax Head approve,
             * status maju ke WAITING_PIC.
             */
            $submission->status = Submission::STATUS_APPROVED_TAX;
            $submission->save();
        });

        return response()->json([
            'message' => 'Submission berhasil di-approve oleh Tax Head.',
            'data' => $this->transform($submission->fresh(['requestor', 'approvals.actor']), true),
        ]);
    }

    /**
     * POST /approvals/{submission}/resolve
     *
     * PIC menyelesaikan ticket.
     * Jika request type "New", PIC harus input customer code.
     *
     * Status: WAITING_PIC → TICKET_SOLVED
     */
    public function resolve(Request $request, Submission $submission)
    {
        if ($submission->status !== Submission::STATUS_WAITING_PIC) {
            return response()->json([
                'message' => 'Submission tidak dalam status Waiting for PIC.',
            ], 422);
        }

        $rules = [
            'notes' => 'nullable|string|max:1000',
        ];

        /*
         * Jika request type "New",
         * customer code wajib diisi oleh PIC.
         */
        $formData = $submission->form_data ?? [];
        $isNewRequest = ($formData['requestType'] ?? '') === 'New';

        if ($isNewRequest) {
            $rules['customer_code'] = 'required|string|max:50';
        }

        $request->validate($rules);

        DB::transaction(function () use ($request, $submission, $isNewRequest) {
            $stepData = [];

            if ($isNewRequest && $request->has('customer_code')) {
                $stepData['customerCode'] = $request->input('customer_code');

                /*
                 * Simpan customer code ke form_data.
                 */
                $formData = $submission->form_data ?? [];
                $formData['customerCode'] = $request->input('customer_code');
                $submission->form_data = $formData;
            }

            SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'PIC_PROCESS',
                'action' => 'SOLVED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes'),
                'step_data' => !empty($stepData) ? $stepData : null,
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_TICKET_SOLVED;
            $submission->save();
        });

        return response()->json([
            'message' => 'Ticket berhasil diselesaikan.',
            'data' => $this->transform($submission->fresh(['requestor', 'approvals.actor']), true),
        ]);
    }

    /**
     * POST /approvals/{submission}/cancel
     *
     * Cancel hanya dapat dilakukan oleh requestor di halaman My Submission.
     */
    public function cancel(Request $request, Submission $submission)
    {
        return response()->json([
            'message' => 'Cancel ticket hanya dapat dilakukan oleh requestor melalui halaman My Submission.',
        ], 403);
    }

    /**
     * POST /approvals/{submission}/reject
     *
     * Reject hanya bisa dilakukan oleh Division Head, Accounting Head, dan Tax Head.
     * PIC tidak bisa me-reject (hanya bisa resolve).
     */
    public function reject(Request $request, Submission $submission)
    {
        $allowedStatuses = [
            Submission::STATUS_REVIEW_DIV_HEAD,
            Submission::STATUS_REVIEW_ACCOUNTING,
            Submission::STATUS_REVIEW_TAX,
        ];

        if (!in_array($submission->status, $allowedStatuses, true)) {
            return response()->json([
                'message' => 'Submission tidak dapat di-reject pada tahap ini. Hanya Division Head, Accounting Head, dan Tax Head yang dapat me-reject submission.',
            ], 422);
        }

        $request->validate([
            'notes' => 'required|string|max:1000',
        ], [
            'notes.required' => 'Catatan alasan reject wajib diisi.',
        ]);

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

        return response()->json([
            'message' => 'Submission berhasil di-reject.',
            'data' => $this->transform(
                $submission->fresh([
                    'requestor',
                    'approvals.actor',
                ]),
                true
            ),
        ]);
    }

    /**
     * Format response.
     */
    private function transform(
        Submission $submission,
        bool $detail = false
    ): array {
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
            'submitted_at' => $submission->submitted_at,

            'requestor' => [
                'id' => $submission->requestor_id,
                'name' => $submission->requestor?->name,
                'email' => $submission->requestor?->email,
            ],
        ];

        if ($detail) {
            $data['form_data'] = $submission->form_data;
            $data['attachments'] = $submission->attachments ?? [];

            $data['approval_history'] = $submission->approvals
                ->map(fn(SubmissionApproval $a) => [
                    'id' => $a->id,
                    'step' => $a->step,
                    'action' => $a->action,
                    'notes' => $a->notes,
                    'step_data' => $a->step_data,
                    'actor' => [
                        'id' => $a->acted_by,
                        'name' => $a->actor?->name,
                        'email' => $a->actor?->email,
                    ],
                    'created_at' => $a->created_at,
                ])
                ->values()
                ->all();
        }

        return $data;
    }
}
