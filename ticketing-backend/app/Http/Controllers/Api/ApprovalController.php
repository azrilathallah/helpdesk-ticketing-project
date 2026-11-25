<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Approver;
use App\Models\Submission;
use App\Services\Approval\ApprovalAuthorizationService;
use App\Services\Approval\ApprovalFormServiceResolver;
use App\Services\Approval\ApprovalQueryService;
use App\Services\SubmissionAttachmentService;
use App\Services\SubmissionPdfService;
use App\Services\Email\TicketEmailNotificationService;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(
        private ApprovalQueryService $queries,
        private ApprovalAuthorizationService $auth,
        private TicketEmailNotificationService $emailNotifier
    ) {}

    public function index()
    {
        return $this->queries->index();
    }
    public function show(Submission $submission)
    {
        return $this->queries->show($submission);
    }

    public function attachment(Request $request, Submission $submission, int $index)
    {
        abort_unless(
            $this->auth->canView($request->user(), $submission),
            403,
            'You do not have access to this attachment.'
        );

        return SubmissionAttachmentService::response($submission, $index);
    }

    public function pdf(Request $request, Submission $submission, SubmissionPdfService $pdfService)
    {
        $user = $request->user();

        abort_unless(
            $submission->status === Submission::STATUS_TICKET_SOLVED,
            422,
            'PDF can only be downloaded after the request has been resolved.'
        );

        $isPic = $user && (
            $this->auth->userHasRoleForSubmission($user, $submission, Approver::ROLE_PIC)
            || $submission->approvals()
            ->where('acted_by', $user->id)
            ->where(function ($q) {
                $q->where('step', 'PIC_PROCESS')
                    ->orWhere('action', 'SOLVED');
            })
            ->exists()
        );

        abort_unless(
            $isPic,
            403,
            'Only PIC can download this PDF.'
        );

        return $pdfService->download($submission);
    }

    private function formService(Submission $submission)
    {
        $service = ApprovalFormServiceResolver::for($submission);
        abort_if($service === null, 422, 'Unrecognized submission');
        return $service;
    }

    private function runAndNotify(
        Request $request,
        Submission $submission,
        callable $action,
        string $event
    ) {
        $response = $action();

        if (
            method_exists($response, 'getStatusCode')
            && $response->getStatusCode() >= 200
            && $response->getStatusCode() < 300
        ) {
            $notes = trim((string) ($request->input('notes') ?? $request->input('solution') ?? ''));

            $this->emailNotifier->notify(
                $submission->fresh(['requestor']),
                $event,
                $request->user(),
                $notes !== '' ? $notes : null
            );
        }

        return $response;
    }

    public function approveAccDeptHead(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_ACC_DEPT_HEAD);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->approveAccDeptHead($request, $submission),
            'approved'
        );
    }
    public function approveDivHead(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, ApprovalAuthorizationService::ROLE_DIV_HEAD);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->approveDivHead($request, $submission),
            'approved'
        );
    }
    public function fillAccounting(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_ACCOUNTING_STAFF);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->fillAccounting($request, $submission),
            'filled'
        );
    }
    public function approveAccountingHead(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_ACCOUNTING_HEAD);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->approveAccountingHead($request, $submission),
            'approved'
        );
    }
    public function fillTax(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_TAX_STAFF);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->fillTax($request, $submission),
            'filled'
        );
    }
    public function approveTaxHead(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_TAX_HEAD);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->approveTaxHead($request, $submission),
            'approved'
        );
    }
    public function submitCr(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_PIC);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->submitCr($request, $submission),
            'cr_submitted'
        );
    }
    public function assignModule(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_PIC);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->assignModule($request, $submission),
            'module_assigned'
        );
    }
    public function approveRequestor(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, ApprovalAuthorizationService::ROLE_REQUESTOR);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->approveRequestor($request, $submission),
            'approved'
        );
    }
    public function approveITSapHead(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_IT_SAP_HEAD);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->approveITSapHead($request, $submission),
            'approved'
        );
    }
    public function resolve(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_PIC);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->resolve($request, $submission),
            'resolved'
        );
    }
    public function reject(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->reject($request, $submission),
            'rejected'
        );
    }
    public function revise(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission);
        return $this->runAndNotify(
            $request,
            $submission,
            fn() => $this->formService($submission)->revise($request, $submission),
            'revised'
        );
    }
}
