<?php

namespace App\Services;

use App\Models\ChoiceGroup;
use App\Models\Submission;
use App\Models\SubmissionApproval;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;
use Symfony\Component\HttpFoundation\Response;

class SubmissionPdfService
{
    public function __construct(
        private readonly ?QrSignatureService $qrSignatureService = null
    ) {}

    public static function supportsPdf(Submission $submission): bool
    {
        $category = strtolower(trim((string) $submission->category));

        if ($category === 'support') {
            $formData = $submission->form_data ?? [];
            return !empty($formData['hasCrForm'])
                || strtolower(trim((string) ($formData['needCrForm'] ?? ''))) === 'yes';
        }

        $subCategory = strtolower(trim((string) $submission->sub_category));

        return in_array($subCategory, [
            'customer',
            'vendor',
            'gl',
            'user id',
            'material',
            'cost center and profit center',
        ], true);
    }

    public function download(Submission $submission): Response
    {
        $submission->loadMissing(['requestor', 'approvals.actor']);

        abort_unless(
            self::supportsPdf($submission),
            422,
            'PDF generation is not available for this request.'
        );

        $category = strtolower(trim((string) $submission->category));
        if ($category === 'support') {
            return $this->downloadSapSupportCrPdf($submission);
        }

        return match (strtolower(trim((string) $submission->sub_category))) {
            'customer' => $this->downloadCustomerPdf($submission),
            'vendor' => $this->downloadVendorPdf($submission),
            'gl' => $this->downloadGlPdf($submission),
            'user id' => $this->downloadUserIdPdf($submission),
            'material' => $this->downloadMaterialPdf($submission),
            'cost center and profit center' => $this->downloadCostProfitPdf($submission),
            default => abort(422, 'PDF generation is not supported for this form type.'),
        };
    }

    private function downloadCustomerPdf(Submission $submission): Response
    {
        $form = $submission->form_data ?? [];

        $groupMapping = [
            'customer_request_type' => 'requestType',
            'customer_account_group' => 'accountGroup',
            'customer_company_code' => 'companyCode',
            'customer_sales_organization' => 'salesOrganization',
            'customer_distribution_channel' => 'distributionChannel',
            'customer_division' => 'division',
            'customer_class' => 'customerClass',
            'customer_sort_key' => 'sortKey',
            'customer_payment_terms' => 'paymentTerms',
            'customer_tolerance_group' => 'toleranceGroup',
            'customer_witholding_tax' => 'witholdingTax',
            'customer_currency' => 'currency',
            'customer_pricing_procedure' => 'customerPricingProcedure',
            'customer_statistic_group' => 'customerStatisticGroup',
            'customer_tax_classification' => 'taxClassification',
        ];

        return $this->renderPdfView('pdf.customer', $submission, [
            'form' => $form,
            'choiceGroups' => $this->resolveChoiceGroups($form, $groupMapping),
            'npwpDateParts' => $this->parseDateParts($form['npwpregisteredDate'] ?? null),
        ]);
    }

    private function downloadVendorPdf(Submission $submission): Response
    {
        $form = $submission->form_data ?? [];

        $groupMapping = [
            'vendor_request_type' => 'requestType',
            'vendor_account_group' => 'accountGroup',
            'vendor_recon_account' => 'reconAccount',
            'vendor_payment_method' => 'paymentMethod',
            'vendor_witholding_tax' => 'witholdingTax',
            'vendor_company_code' => 'companyCode',
            'vendor_due_date_payment' => 'dueDatePayment',
            'vendor_currency' => 'currency',
        ];

        return $this->renderPdfView('pdf.vendor', $submission, [
            'form' => $form,
            'choiceGroups' => $this->resolveChoiceGroups($form, $groupMapping),
        ]);
    }

    private function downloadGlPdf(Submission $submission): Response
    {
        $form = $submission->form_data ?? [];

        $groupMapping = [
            'gl_company_code' => 'companyCode',
            'gl_request_type' => 'requestType',
            'gl_account_group' => 'accountGroup',
            'gl_only_balances_local_currency' => 'onlyBalancesLocalCurrency',
            'gl_tax_category' => 'taxCategory',
            'gl_posting_without_tax' => 'postingWithoutTax',
            'gl_recon_acct_for_acct_type' => 'reconAcctForAcctType',
            'gl_open_item_management' => 'openItemManagement',
            'gl_line_item_display' => 'lineItemDisplay',
            'gl_posting_automatically_only' => 'postingAutomaticallyOnly',
            'gl_cost_element_group' => 'costElementGroup',
        ];

        return $this->renderPdfView('pdf.gl', $submission, [
            'form' => $form,
            'choiceGroups' => $this->resolveChoiceGroups($form, $groupMapping),
        ]);
    }

    private function downloadUserIdPdf(Submission $submission): Response
    {
        $form = $submission->form_data ?? [];

        $groupMapping = [
            'user-id_company_code' => 'companyCode',
            'user-id_request_type' => 'requestType',
            'user-id_access_sap_server' => 'accessSapServer',
            'user-id_priority' => 'priority',
            'user-id_funtion_module' => 'funtionModule',
        ];

        return $this->renderPdfView('pdf.userid', $submission, [
            'form' => $form,
            'choiceGroups' => $this->resolveChoiceGroups($form, $groupMapping),
        ]);
    }

    private function downloadMaterialPdf(Submission $submission): Response
    {
        $form = $submission->form_data ?? [];
        if (empty($form['accAssignementGroup']) && !empty($form['AccAssignementGroup'])) {
            $form['accAssignementGroup'] = $form['AccAssignementGroup'];
        }

        $groupMapping = [
            'material_request_type' => 'requestType',
            'material_industry_sector' => 'industrySector',
            'material_type' => 'materialType',
            'material_plant' => 'plant',
            'material_sales_organization' => 'salesOrganization',
            'material_distribution_channel' => 'distributionChannel',
            'material_group' => 'materialGroup',
            'material_division' => 'division',
            'material_genitemcatgroup' => 'genItemCatGroup',
            'material_tax' => 'tax',
            'material_matl_statis_group' => 'matlStatisGroup',
            'material_acc_assignement_group' => 'accAssignementGroup',
        ];

        return $this->renderPdfView('pdf.material', $submission, [
            'form' => $form,
            'choiceGroups' => $this->resolveChoiceGroups($form, $groupMapping),
        ]);
    }

    private function downloadCostProfitPdf(Submission $submission): Response
    {
        $form = $submission->form_data ?? [];

        $submit = $this->findLatest(
            $submission->approvals ?? collect(),
            ['REQUESTOR_SUBMIT', 'REQUESTOR_RESUBMIT'],
            ['SUBMITTED', 'RESUBMITTED']
        );

        return $this->renderPdfView('pdf.costprofit', $submission, [
            'form' => $form,
            'requestDateFormatted' => $this->formatDate($submit?->created_at ?? $submission->created_at, 'd-M-y'),
        ], 'landscape');
    }

    private function downloadSapSupportCrPdf(Submission $submission): Response
    {
        $formData = $submission->form_data ?? [];
        $cr = is_array($formData['crData'] ?? null) ? $formData['crData'] : [];

        $groupMapping = [
            'sap-support_implication' => 'implication',
            'sap-support_priority' => 'priority',
        ];

        return $this->renderPdfView('pdf.sapsupport_cr', $submission, [
            'cr' => $cr,
            'choiceGroups' => $this->resolveChoiceGroups($cr, $groupMapping),
            'requestDateFormatted' => $this->formatDate($cr['requestDate'] ?? $submission->created_at, 'd F Y'),
            'targetDateFormatted' => $this->formatDate($cr['targetDate'] ?? null, 'd F Y'),
        ]);
    }

    private function renderPdfView(
        string $view,
        Submission $submission,
        array $extraData = [],
        string $orientation = 'portrait'
    ): Response {
        $requestor = [
            'name' => $submission->requestor?->name ?? '',
            'nik' => $submission->requestor?->nik ?? '',
            'position' => $submission->requestor?->position ?? '',
            'division' => $submission->requestor?->division ?? '',
            'department' => $submission->requestor?->department ?? '',
            'telephone' => $submission->requestor?->telephone ?? '',
            'email' => $submission->requestor?->email ?? '',
        ];

        $logoBase64 = null;
        $logoPath = public_path('icon/logo-ibsw.png');
        if (is_file($logoPath)) {
            $logoBase64 = 'data:image/png;base64,' . base64_encode((string) file_get_contents($logoPath));
        }

        $pdf = Pdf::loadView($view, array_merge([
            'submission' => $submission,
            'requestor' => $requestor,
            'approvals' => $this->buildApprovalColumns($submission),
            'logoBase64' => $logoBase64,
        ], $extraData))->setPaper('a4', $orientation);

        $filename = ($submission->number ?: 'Request') . '.pdf';

        return $pdf->download($filename);
    }

    /**
     * @param array<string, mixed> $form
     * @param array<string, string> $groupMapping
     */
    private function resolveChoiceGroups(array $form, array $groupMapping): array
    {
        $dbGroups = ChoiceGroup::query()
            ->with(['options' => fn($q) => $q->orderBy('sort_order')->orderBy('id')])
            ->whereIn('key', array_keys($groupMapping))
            ->get()
            ->keyBy('key');

        $choiceGroups = [];

        foreach ($groupMapping as $key => $field) {
            $rawVal = $form[$field] ?? '';
            $selectedList = is_array($rawVal)
                ? array_map(fn($v) => strtoupper(trim((string) $v)), $rawVal)
                : (trim((string) $rawVal) !== '' ? [strtoupper(trim((string) $rawVal))] : []);

            $options = [];
            $groupModel = $dbGroups->get($key);

            if ($groupModel) {
                foreach ($groupModel->options as $opt) {
                    $code = trim((string) $opt->value);
                    $options[] = [
                        'value' => $code,
                        'label' => trim((string) $opt->label),
                        'checked' => in_array(strtoupper($code), $selectedList, true),
                    ];
                }
            }

            $choiceGroups[$key] = $options;
        }

        return $choiceGroups;
    }

    private function buildApprovalColumns(Submission $submission): array
    {
        $history = $submission->approvals ?? collect();

        $submit = $this->findLatest($history, ['REQUESTOR_SUBMIT', 'REQUESTOR_RESUBMIT'], ['SUBMITTED', 'RESUBMITTED']);
        $crRequestor = $this->findLatest($history, ['REQUESTOR_APPROVE'], ['APPROVED']);
        $accDeptHead = $this->findLatest($history, ['ACC_DEPT_HEAD_APPROVE'], ['APPROVED']);
        $divHead = $this->findLatest($history, ['DIV_HEAD_APPROVE'], ['APPROVED']);
        $accHead = $this->findLatest($history, ['ACCOUNTING_HEAD_APPROVE'], ['APPROVED']);
        $taxHead = $this->findLatest($history, ['TAX_HEAD_APPROVE'], ['APPROVED']);
        $itSapHead = $this->findLatest($history, ['IT_SAP_HEAD_APPROVE'], ['APPROVED']);
        $pic = $this->findLatest($history, ['PIC_PROCESS'], ['SOLVED']);

        $submitDate = $submit?->created_at ?? $submission->created_at;
        $qrService = $this->qrSignatureService ?? app(QrSignatureService::class);
        $isSupport = strtolower(trim((string) $submission->category)) === 'support';

        $requestorName = $submission->requestor?->name ?? '';
        $crRequestorName = $crRequestor?->actor?->name ?? $requestorName;

        return [
            'requestor' => [
                'name' => $requestorName,
                'date' => $this->formatDate($submitDate),
                'qr' => ($submit !== null || $requestorName !== '')
                    ? $qrService->generateForSignature($submission, 'requestor', $submit)
                    : null,
            ],
            'cr_requestor' => [
                'name' => $crRequestorName,
                'date' => $this->formatDate($crRequestor?->created_at ?? $submitDate),
                'qr' => ($isSupport && ($crRequestor !== null || $crRequestorName !== ''))
                    ? $qrService->generateForSignature($submission, 'cr_requestor', $crRequestor ?? $submit)
                    : null,
            ],
            'acc_dept_head' => [
                'name' => $accDeptHead?->actor?->name ?? '',
                'date' => $this->formatDate($accDeptHead?->created_at),
                'qr' => $accDeptHead !== null
                    ? $qrService->generateForSignature($submission, 'acc_dept_head', $accDeptHead)
                    : null,
            ],
            'div_head' => [
                'name' => $divHead?->actor?->name ?? '',
                'date' => $this->formatDate($divHead?->created_at),
                'qr' => $divHead !== null
                    ? $qrService->generateForSignature($submission, 'div_head', $divHead)
                    : null,
            ],
            'accounting' => [
                'name' => $accHead?->actor?->name ?? '',
                'date' => $this->formatDate($accHead?->created_at),
                'qr' => $accHead !== null
                    ? $qrService->generateForSignature($submission, 'accounting', $accHead)
                    : null,
            ],
            'tax' => [
                'name' => $taxHead?->actor?->name ?? '',
                'date' => $this->formatDate($taxHead?->created_at),
                'qr' => $taxHead !== null
                    ? $qrService->generateForSignature($submission, 'tax', $taxHead)
                    : null,
            ],
            'it_sap_head' => [
                'name' => $itSapHead?->actor?->name ?? '',
                'date' => $this->formatDate($itSapHead?->created_at),
                'qr' => $itSapHead !== null
                    ? $qrService->generateForSignature($submission, 'it_sap_head', $itSapHead)
                    : null,
            ],
            'pic' => [
                'name' => $pic?->actor?->name ?? '',
                'date' => $this->formatDate($pic?->created_at),
                'qr' => $pic !== null
                    ? $qrService->generateForSignature($submission, 'pic', $pic)
                    : null,
            ],
        ];
    }

    private function findLatest($history, array $steps, array $actions): ?SubmissionApproval
    {
        return $history
            ->filter(fn(SubmissionApproval $a) => in_array($a->step, $steps, true) && in_array($a->action, $actions, true))
            ->last();
    }

    private function formatDate($date, string $format = 'd / m / Y'): string
    {
        if (!$date) {
            return '';
        }

        try {
            return Carbon::parse($date)->format($format);
        } catch (\Throwable) {
            return (string) $date;
        }
    }

    /**
     * @return array{day: string, month: string, year: string}
     */
    private function parseDateParts($date): array
    {
        if (!$date) {
            return ['day' => '', 'month' => '', 'year' => ''];
        }

        try {
            $parsed = Carbon::parse($date);
            return [
                'day' => $parsed->format('d'),
                'month' => $parsed->format('m'),
                'year' => $parsed->format('Y'),
            ];
        } catch (\Throwable) {
            return ['day' => '', 'month' => '', 'year' => ''];
        }
    }
}
