const STYLES = {
  draft: "bg-slate-100 text-slate-700 ring-slate-200",
  actionApproval: "bg-blue-50 text-blue-700 ring-blue-200",
  actionCrApproval: "bg-sky-50 text-sky-700 ring-sky-200",
  actionAccounting: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  actionTax: "bg-violet-50 text-violet-700 ring-violet-200",
  actionPic: "bg-amber-50 text-amber-700 ring-amber-200",
  actionRevision: "bg-orange-50 text-orange-700 ring-orange-200",
  waiting: "bg-slate-50 text-slate-700 ring-slate-200",
  waitingRevision: "bg-amber-50 text-amber-700 ring-amber-200",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  solved: "bg-green-50 text-green-700 ring-green-200",
  cancelled: "bg-slate-100 text-slate-600 ring-slate-200",
  rejected: "bg-red-50 text-red-700 ring-red-200",
};

function getFormKey(submission) {
  if (
    String(submission?.category || "")
      .trim()
      .toLowerCase() === "support"
  ) {
    return "support";
  }

  return String(submission?.sub_category || "")
    .trim()
    .toLowerCase();
}

function getNextStageForApprovedDivHead(submission) {
  const formKey = getFormKey(submission);

  if (formKey === "support") {
    return {
      label: "Review IT-SAP Head",
      style: STYLES.waiting,
    };
  }

  if (formKey === "customer" || formKey === "vendor") {
    return {
      label: "Review Accounting",
      style: STYLES.waiting,
    };
  }

  if (formKey === "material") {
    const materialType = String(submission?.form_data?.materialType || "")
      .trim()
      .toUpperCase();

    if (materialType === "YPRO" || materialType === "ZCOM") {
      return {
        label: "Review Accounting",
        style: STYLES.waiting,
      };
    }

    if (materialType !== "") {
      return {
        label: "Waiting PIC",
        style: STYLES.waiting,
      };
    }

    return {
      label: "Approved by Division Head",
      style: STYLES.waiting,
    };
  }

  return {
    label: "Waiting PIC",
    style: STYLES.waiting,
  };
}

function getNextStageForApprovedAccountingHead(submission) {
  const formKey = getFormKey(submission);

  if (formKey === "customer" || formKey === "vendor") {
    return {
      label: "Review Tax",
      style: STYLES.waiting,
    };
  }

  if (formKey === "gl") {
    return {
      label: "Review Division Head",
      style: STYLES.waiting,
    };
  }

  return {
    label: "Waiting PIC",
    style: STYLES.waiting,
  };
}

function getApprovalActionDisplay(submission) {
  const status = submission?.status;
  const role = submission?.approval_role;

  if (
    [
      "REVISION_REQUESTOR",
      "REVISION_ACCOUNTING",
      "REVISION_TAX",
      "REVISION_PIC",
    ].includes(status)
  ) {
    return {
      label: "Needs Revision",
      style: STYLES.actionRevision,
    };
  }

  switch (role) {
    case "accounting":
      return {
        label: "Needs Accounting Data",
        style: STYLES.actionAccounting,
      };
    case "tax":
      return {
        label: "Needs Tax Data",
        style: STYLES.actionTax,
      };
    case "pic":
      return {
        label: "Needs Action",
        style: STYLES.actionPic,
      };
    case "requestor":
      return {
        label: "Needs Approval",
        style: STYLES.actionCrApproval,
      };
    case "division_head":
    case "accounting_dept_head":
    case "accounting_head":
    case "tax_head":
    case "it_sap_head":
      return {
        label: "Needs Approval",
        style: STYLES.actionApproval,
      };
    default:
      return null;
  }
}

/**
 * Resolve a clear, context-aware status label and badge style without changing backend status values.
 *
 * @param {object} submission
 * @param {"submission"|"approval"} mode
 */
export function getStatusDisplay(submission, mode = "submission") {
  const status = submission?.status;
  const isApproval = mode === "approval";

  // Terminal & draft statuses are identical for everyone
  if (status === "DRAFT") {
    return { label: "Draft", style: STYLES.draft };
  }
  if (status === "TICKET_SOLVED") {
    return { label: "Solved", style: STYLES.solved };
  }
  if (status === "TICKET_CANCELLED") {
    return { label: "Cancelled", style: STYLES.cancelled };
  }
  if (status === "TICKET_REJECTED") {
    return { label: "Rejected", style: STYLES.rejected };
  }

  // Approval Page: if it's currently this actor's turn, show the exact action required from them
  if (isApproval && submission?.can_act) {
    const actionDisplay = getApprovalActionDisplay(submission);
    if (actionDisplay) {
      return actionDisplay;
    }
  }

  // Submission Page: highlight actions required from Requestor and show "Approved by ..." progress
  if (!isApproval) {
    switch (status) {
      case "REVISION_REQUESTOR":
        return { label: "Needs Revision", style: STYLES.actionRevision };
      case "REVIEW_REQUESTOR":
        return {
          label: "Needs Approval",
          style: STYLES.actionCrApproval,
        };
      case "APPROVED_ACC_DEPT_HEAD":
        return {
          label: "Approved by Accounting Dept Head",
          style: STYLES.approved,
        };
      case "APPROVED_DIV_HEAD":
        return { label: "Approved by Division Head", style: STYLES.approved };
      case "APPROVED_ACCOUNTING_HEAD":
        return {
          label: "Approved by Accounting Head",
          style: STYLES.approved,
        };
      case "APPROVED_TAX_HEAD":
        return { label: "Approved by Tax Head", style: STYLES.approved };
      case "APPROVED_IT_SAP_HEAD":
        return { label: "Approved by IT-SAP Head", style: STYLES.approved };
      default:
        break;
    }
  }

  // Review / In-progress labels (for Requestor on Submission Page, or Approver who already acted)
  switch (status) {
    case "REVIEW_REQUESTOR":
      return {
        label: "Review Requestor",
        style: STYLES.waiting,
      };
    case "APPROVED_REQUESTOR":
    case "REVIEW_DIV_HEAD":
      return {
        label: "Review Division Head",
        style: STYLES.waiting,
      };
    case "REVIEW_ACC_DEPT_HEAD":
      return {
        label: "Review Accounting Dept Head",
        style: STYLES.waiting,
      };
    case "APPROVED_ACC_DEPT_HEAD":
    case "REVIEW_ACCOUNTING_HEAD":
      return {
        label: "Review Accounting Head",
        style: STYLES.waiting,
      };
    case "APPROVED_DIV_HEAD":
      return getNextStageForApprovedDivHead(submission);
    case "APPROVED_ACCOUNTING_HEAD":
      return getNextStageForApprovedAccountingHead(submission);
    case "REVIEW_TAX_HEAD":
      return {
        label: "Review Tax Head",
        style: STYLES.waiting,
      };
    case "APPROVED_TAX_HEAD":
    case "APPROVED_IT_SAP_HEAD":
    case "WAITING_PIC":
      return {
        label: "Waiting PIC",
        style: STYLES.waiting,
      };
    case "REVIEW_IT_SAP_HEAD":
      return {
        label: "Review IT-SAP Head",
        style: STYLES.waiting,
      };
    case "REVISION_REQUESTOR":
      return {
        label: "Waiting Requestor Revision",
        style: STYLES.waitingRevision,
      };
    case "REVISION_ACCOUNTING":
      return {
        label: isApproval
          ? "Waiting Accounting Revision"
          : "In Progress (Accounting Revision)",
        style: STYLES.waitingRevision,
      };
    case "REVISION_TAX":
      return {
        label: isApproval
          ? "Waiting Tax Revision"
          : "In Progress (Tax Revision)",
        style: STYLES.waitingRevision,
      };
    case "REVISION_PIC":
      return {
        label: isApproval
          ? "Waiting PIC Revision"
          : "In Progress (PIC Revision)",
        style: STYLES.waitingRevision,
      };
    default:
      return {
        label: status || "-",
        style: STYLES.draft,
      };
  }
}

export default function StatusBadge({
  submission,
  status,
  mode = "submission",
}) {
  const item = submission || { status };
  const config = getStatusDisplay(item, mode);

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-lg px-2 py-1 text-xs font-semibold ring-1 ring-inset ${config.style}`}
    >
      {config.label}
    </span>
  );
}
