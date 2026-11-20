<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Approver;
use App\Models\Submission;
use App\Services\Approval\ApprovalAuthorizationService;
use App\Services\Approval\ApprovalFormServiceResolver;
use App\Services\Approval\ApprovalQueryService;
use App\Services\SubmissionAttachmentService;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(
        private ApprovalQueryService $queries,
        private ApprovalAuthorizationService $auth
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

    private function formService(Submission $submission)
    {
        $service = ApprovalFormServiceResolver::for($submission);
        abort_if($service === null, 422, 'Unrecognized submission');
        return $service;
    }

    public function approveAccDeptHead(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_ACC_DEPT_HEAD);
        return $this->formService($submission)->approveAccDeptHead($request, $submission);
    }
    public function approveDivHead(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, ApprovalAuthorizationService::ROLE_DIV_HEAD);
        return $this->formService($submission)->approveDivHead($request, $submission);
    }
    public function fillAccounting(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_ACCOUNTING_STAFF);
        return $this->formService($submission)->fillAccounting($request, $submission);
    }
    public function approveAccountingHead(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_ACCOUNTING_HEAD);
        return $this->formService($submission)->approveAccountingHead($request, $submission);
    }
    public function fillTax(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_TAX_STAFF);
        return $this->formService($submission)->fillTax($request, $submission);
    }
    public function approveTaxHead(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_TAX_HEAD);
        return $this->formService($submission)->approveTaxHead($request, $submission);
    }
    public function submitCr(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_PIC);
        return $this->formService($submission)->submitCr($request, $submission);
    }
    public function assignModule(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_PIC);
        return $this->formService($submission)->assignModule($request, $submission);
    }
    public function approveRequestor(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, ApprovalAuthorizationService::ROLE_REQUESTOR);
        return $this->formService($submission)->approveRequestor($request, $submission);
    }
    public function approveITSapHead(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_IT_SAP_HEAD);
        return $this->formService($submission)->approveITSapHead($request, $submission);
    }
    public function resolve(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission, Approver::ROLE_PIC);
        return $this->formService($submission)->resolve($request, $submission);
    }
    public function reject(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission);
        return $this->formService($submission)->reject($request, $submission);
    }
    public function revise(Request $request, Submission $submission)
    {
        $this->auth->authorizeAction($request->user(), $submission);
        return $this->formService($submission)->revise($request, $submission);
    }
}
