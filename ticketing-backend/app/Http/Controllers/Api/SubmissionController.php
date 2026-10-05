<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SubmissionController extends Controller
{
    /**
     * GET /submissions
     *
     * Hanya mengambil submission milik requestor yang sedang login.
     */
    public function index(Request $request)
    {
        $submissions = Submission::query()
            ->where('requestor_id', $request->user()->id)
            ->latest()
            ->get()
            ->map(fn(Submission $submission) => $this->transform($submission));

        return response()->json([
            'data' => $submissions,
        ]);
    }

    /**
     * GET /dashboard/stats
     *
     * Mengambil statistik ticket milik requestor
     * yang sedang login.
     */
    public function dashboardStats(Request $request)
    {
        $requestorId = $request->user()->id;

        $baseQuery = Submission::query()
            ->where('requestor_id', $requestorId);

        $total = (clone $baseQuery)
            ->where('status', '!=', Submission::STATUS_DRAFT)
            ->count();

        $open = (clone $baseQuery)
            ->whereIn('status', [
                Submission::STATUS_SUBMITTED,
            ])
            ->count();

        $inProgress = (clone $baseQuery)
            ->whereIn('status', [
                Submission::STATUS_APPROVED_DIV_HEAD,
                Submission::STATUS_REVIEW_ACCOUNTING,
                Submission::STATUS_APPROVED_ACCOUNTING,
                Submission::STATUS_REVIEW_TAX,
                Submission::STATUS_APPROVED_TAX,
                Submission::STATUS_WAITING_PIC,
            ])
            ->count();

        $closed = (clone $baseQuery)
            ->where(
                'status',
                Submission::STATUS_TICKET_SOLVED
            )
            ->count();

        $rejected = (clone $baseQuery)
            ->where(
                'status',
                Submission::STATUS_TICKET_REJECTED
            )
            ->count();

        $cancelled = (clone $baseQuery)
            ->where(
                'status',
                Submission::STATUS_TICKET_CANCELLED
            )
            ->count();

        return response()->json([
            'data' => [
                'total' => $total,
                'open' => $open,
                'in_progress' => $inProgress,
                'closed' => $closed,
                'rejected' => $rejected,
                'cancelled' => $cancelled,
            ],
        ]);
    }

    /**
     * GET /submissions/{submission}
     */
    public function show(
        Request $request,
        Submission $submission
    ) {
        $this->ensureOwner($request, $submission);

        return response()->json([
            'data' => $this->transform(
                $submission,
                true
            ),
        ]);
    }

    /**
     * POST /submissions
     *
     * Membuat submission baru.
     *
     * Draft maupun Submit sama-sama masuk database.
     */
    public function store(Request $request)
    {
        $data = $this->validatePayload($request);

        $submission = DB::transaction(function () use (
            $request,
            $data
        ) {
            $type = $data['type'];

            /*
             * SAP  -> HD_SAP
             * IT   -> IT_
             */
            $prefix = $type === 'SAP'
                ? 'HD_SAP'
                : 'HD_IT';

            $year = (int) now()->format('Y');

            /*
             * Ambil sequence dengan lock.
             *
             * Ini penting agar dua request bersamaan
             * tidak mendapatkan nomor yang sama.
             */
            $sequence = DB::table('form_sequences')
                ->where('prefix', $prefix)
                ->where('year', $year)
                ->lockForUpdate()
                ->first();

            /*
             * Jika belum ada sequence untuk tahun ini.
             */
            if (!$sequence) {
                DB::table('form_sequences')->insert([
                    'prefix' => $prefix,
                    'year' => $year,
                    'last_number' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);

                $sequence = DB::table('form_sequences')
                    ->where('prefix', $prefix)
                    ->where('year', $year)
                    ->lockForUpdate()
                    ->first();
            }

            /*
             * Running number berikutnya.
             */
            $nextNumber = ((int) $sequence->last_number) + 1;

            DB::table('form_sequences')
                ->where('id', $sequence->id)
                ->update([
                    'last_number' => $nextNumber,
                    'updated_at' => now(),
                ]);

            /*
             * Contoh:
             *
             * HD_SAP2026000001
             *
             * IT_2026000001
             */
            $number =
                $prefix .
                $year .
                str_pad(
                    (string) $nextNumber,
                    4,
                    '0',
                    STR_PAD_LEFT
                );

            $submission = Submission::create([
                'requestor_id' => $request->user()->id,

                'number' => $number,

                'type' => $type,

                'category' => $data['category'] ?? null,

                'sub_category' => $data['sub_category'] ?? null,

                'form_type' => $data['form_type'],

                'status' => $data['status'],

                'form_data' => $data['form_data'],

                'attachments' => null,

                'submitted_at' =>
                $data['status'] === 'SUBMITTED'
                    ? now()
                    : null,
            ]);

            /*
             * Simpan attachment jika ada.
             */
            $submission->attachments =
                $this->storeFiles(
                    $request,
                    $submission
                );

            $submission->save();

            return $submission;
        }, 5);

        return response()->json([
            'message' =>
            $submission->status === 'DRAFT'
                ? 'Form berhasil disimpan sebagai draft.'
                : 'Form berhasil disubmit.',

            'data' => $this->transform(
                $submission,
                true
            ),
        ], 201);
    }

    /**
     * POST /submissions/{submission}
     *
     * Digunakan untuk:
     *
     * DRAFT -> DRAFT
     * DRAFT -> SUBMITTED
     *
     * SUBMITTED -> tidak boleh.
     */
    public function update(
        Request $request,
        Submission $submission
    ) {
        $this->ensureOwner(
            $request,
            $submission
        );

        /*
         * Submission yang sudah submit
         * tidak boleh diedit requestor.
         */
        if ($submission->status !== 'DRAFT') {
            return response()->json([
                'message' =>
                'Submission yang sudah disubmit tidak dapat diedit oleh requestor.',
            ], 422);
        }

        $data = $this->validatePayload($request);

        $submission->update([
            'type' => $data['type'],

            'category' =>
            $data['category'] ?? null,

            'sub_category' =>
            $data['sub_category'] ?? null,

            'form_type' =>
            $data['form_type'],

            'form_data' =>
            $data['form_data'],
        ]);

        /*
         * Tambahkan attachment baru jika ada.
         */
        if ($request->hasFile('attachments')) {
            $existing =
                $submission->attachments ?? [];

            $newFiles =
                $this->storeFiles(
                    $request,
                    $submission
                );

            $submission->attachments =
                array_merge(
                    $existing,
                    $newFiles
                );

            $submission->save();
        }

        /*
         * Draft -> Submit.
         */
        if ($data['status'] === 'SUBMITTED') {
            $submission->status = Submission::STATUS_REVIEW_DIV_HEAD;
            $submission->submitted_at = now();
            $submission->save();

            \App\Models\SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => 'DIV_HEAD_REVIEW',
                'action' => 'SUBMITTED',
                'acted_by' => $request->user()->id,
                'notes' => null,
                'created_at' => now(),
            ]);
        }

        return response()->json([
            'message' =>
            $submission->status === 'SUBMITTED'
                ? 'Form berhasil disubmit.'
                : 'Draft berhasil diperbarui.',

            'data' =>
            $this->transform(
                $submission,
                true
            ),
        ]);
    }

    /**
     * Validation dasar payload.
     */
    private function validatePayload(
        Request $request
    ): array {
        $request->validate([
            'data' => [
                'required',
                'json',
            ],

            'attachments' => [
                'sometimes',
                'array',
            ],

            'attachments.*' => [
                'file',
                'max:10240',
            ],
        ]);

        $payload =
            json_decode(
                $request->input('data'),
                true
            );

        if (!is_array($payload)) {
            throw ValidationException::withMessages([
                'data' =>
                'Data form tidak valid.',
            ]);
        }

        $status =
            strtoupper(
                $payload['status'] ?? 'DRAFT'
            );

        if (
            !in_array(
                $status,
                [
                    'DRAFT',
                    'SUBMITTED',
                ],
                true
            )
        ) {
            throw ValidationException::withMessages([
                'status' =>
                'Status harus DRAFT atau SUBMIITED.',
            ]);
        }

        if (
            empty($payload['type']) ||
            !in_array(
                $payload['type'],
                [
                    'SAP',
                    'IT',
                ],
                true
            )
        ) {
            throw ValidationException::withMessages([
                'type' =>
                'Type harus SAP atau IT.',
            ]);
        }

        if (
            empty($payload['form_type'])
        ) {
            throw ValidationException::withMessages([
                'form_type' =>
                'Form type wajib diisi.',
            ]);
        }

        return [
            'type' =>
            $payload['type'],

            'category' =>
            $payload['category'] ?? null,

            'sub_category' =>
            $payload['sub_category'] ?? null,

            'form_type' =>
            $payload['form_type'],

            'status' =>
            $status,

            'form_data' =>
            $payload['form_data'] ?? [],
        ];
    }

    /**
     * Simpan attachment.
     */
    private function storeFiles(
        Request $request,
        Submission $submission
    ): array {
        $files =
            $request->file(
                'attachments',
                []
            );

        if (!$files) {
            return [];
        }

        return collect($files)
            ->map(
                function ($file) use (
                    $submission
                ) {
                    $path =
                        $file->store(
                            'submissions/' .
                                $submission->id,
                            'local'
                        );

                    return [
                        'name' =>
                        $file->getClientOriginalName(),

                        'size' =>
                        $file->getSize(),

                        'type' =>
                        $file->getClientMimeType(),

                        'path' =>
                        $path,
                    ];
                }
            )
            ->values()
            ->all();
    }

    /**
     * POST /submissions/{submission}/cancel
     *
     * Cancel tiket oleh requestor pemilik tiket.
     */
    public function cancel(Request $request, Submission $submission)
    {
        $this->ensureOwner($request, $submission);

        $terminalStatuses = [
            Submission::STATUS_TICKET_SOLVED,
            Submission::STATUS_TICKET_CANCELLED,
            Submission::STATUS_TICKET_REJECTED,
            Submission::STATUS_DRAFT,
        ];

        if (in_array($submission->status, $terminalStatuses, true)) {
            return response()->json([
                'message' => 'Submission tidak dapat di-cancel.',
            ], 422);
        }

        $request->validate([
            'notes' => 'nullable|string|max:1000',
        ]);

        DB::transaction(function () use ($request, $submission) {
            \App\Models\SubmissionApproval::create([
                'submission_id' => $submission->id,
                'step' => $submission->status,
                'action' => 'CANCELLED',
                'acted_by' => $request->user()->id,
                'notes' => $request->input('notes') ?: 'Ticket dibatalkan oleh requestor.',
                'created_at' => now(),
            ]);

            $submission->status = Submission::STATUS_TICKET_CANCELLED;
            $submission->save();
        });

        return response()->json([
            'message' => 'Ticket berhasil dibatalkan.',
            'data' => $this->transform($submission->fresh(['requestor']), true),
        ]);
    }

    /**
     * Pastikan requestor hanya bisa mengakses
     * submission miliknya sendiri.
     */
    private function ensureOwner(
        Request $request,
        Submission $submission
    ): void {
        abort_unless(
            (int) $submission->requestor_id ===
                (int) $request->user()->id,

            403,

            'Anda tidak memiliki akses ke submission ini.'
        );
    }

    /**
     * Format response.
     */
    private function transform(
        Submission $submission,
        bool $detail = false
    ): array {
        $data = [
            'id' =>
            $submission->id,

            'number' =>
            $submission->number,

            'type' =>
            $submission->type,

            'category' =>
            $submission->category,

            'sub_category' =>
            $submission->sub_category,

            'form_type' =>
            $submission->form_type,

            'status' =>
            $submission->status,

            'created_at' =>
            $submission->created_at,

            'updated_at' =>
            $submission->updated_at,

            'submitted_at' =>
            $submission->submitted_at,

            'requestor' => [
                'id' =>
                $submission->requestor_id,

                'name' =>
                $submission->requestor?->name,

                'email' =>
                $submission->requestor?->email,
            ],
        ];

        if ($detail) {
            $data['form_data'] =
                $submission->form_data;

            $data['attachments'] =
                $submission->attachments ?? [];
        }

        return $data;
    }
}
