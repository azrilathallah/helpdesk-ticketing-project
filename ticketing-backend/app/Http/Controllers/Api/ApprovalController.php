<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Submission;
use App\Services\Approval\ApprovalFormServiceResolver;
use App\Services\Approval\ApprovalQueryService;
use Illuminate\Http\Request;

class ApprovalController extends Controller
{
    public function __construct(private ApprovalQueryService $queries) {}

    public function index()
    {
        return $this->queries->index();
    }
    public function show(Submission $submission)
    {
        return $this->queries->show($submission);
    }

    private function formService(Submission $submission)
    {
        $service = ApprovalFormServiceResolver::for($submission);
        abort_if($service === null, 422, 'Sub category submission tidak dikenali.');
        return $service;
    }

    public function approveAccDeptHead(Request $request, Submission $submission)
    {
        return $this->formService($submission)->approveAccDeptHead($request, $submission);
    }
    public function approveDivHead(Request $request, Submission $submission)
    {
        return $this->formService($submission)->approveDivHead($request, $submission);
    }
    public function fillAccounting(Request $request, Submission $submission)
    {
        return $this->formService($submission)->fillAccounting($request, $submission);
    }
    public function approveAccountingHead(Request $request, Submission $submission)
    {
        return $this->formService($submission)->approveAccountingHead($request, $submission);
    }
    public function fillTax(Request $request, Submission $submission)
    {
        return $this->formService($submission)->fillTax($request, $submission);
    }
    public function approveTaxHead(Request $request, Submission $submission)
    {
        return $this->formService($submission)->approveTaxHead($request, $submission);
    }
    public function resolve(Request $request, Submission $submission)
    {
        return $this->formService($submission)->resolve($request, $submission);
    }
    public function reject(Request $request, Submission $submission)
    {
        return $this->formService($submission)->reject($request, $submission);
    }
    public function revise(Request $request, Submission $submission)
    {
        return $this->formService($submission)->revise($request, $submission);
    }
}
