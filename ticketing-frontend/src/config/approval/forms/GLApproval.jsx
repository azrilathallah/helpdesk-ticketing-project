import { DEFAULT_GL_FORM } from "../../../components/forms-sap-masterdata/gl/GLFormFields";

/* =========================================================
   GL APPROVAL CONFIGURATION
========================================================= */

export const glApproval = {
  getDefaultForm: () => DEFAULT_GL_FORM,

  getRole(status) {
    switch (status) {
      case "REVIEW_ACC_DEPT_HEAD":
        return "accounting_dept_head";
      case "APPROVED_ACC_DEPT_HEAD":
        return "accounting";
      case "APPROVED_ACCOUNTING_HEAD":
        return "division_head";
      case "APPROVED_DIV_HEAD":
      case "WAITING_PIC":
        return "pic";
      default:
        return null;
    }
  },
};

/* =========================================================
   GL APPROVAL ACTIONS
========================================================= */

export function createGLActions(context) {
  const {
    approvalApi,
    isGLSubmission,
    submission,
    processing,
    setProcessing,
    setActionError,
    loadDetail,
    navigate,
    primaryButton,
    rejectButton,
    revisionButton,
    openRejectModal,
    openRevisionModal,
  } = context;

  const handleGLAction = async (action) => {
    if (!isGLSubmission) return;
    if (!submission || processing) return;

    try {
      setProcessing(true);
      setActionError("");

      let response;

      switch (action) {
        case "approve-acc-depthead":
          response = await approvalApi.approveAccDeptHead(submission.id, "");
          break;

        case "approve-accounting":
          response = await approvalApi.approveAccountingHead(submission.id, "");
          break;

        case "approve-divhead":
          response = await approvalApi.approveDivHead(submission.id, "");
          break;

        case "resolve":
          response = await approvalApi.resolve(
            submission.id,
            "",
            "",
            false,
            false,
          );

          window.alert(
            response?.data?.message || "The request was successfully resolved.",
          );

          navigate("/approval");
          return;

        default:
          return;
      }

      window.alert(response?.data?.message || "The action was successfully completed.");

      await loadDetail();
    } catch (err) {
      console.error(err);

      setActionError(err.response?.data?.message || "The action failed.");
    } finally {
      setProcessing(false);
    }
  };

  const renderGLActionButtons = () => {
    if (!isGLSubmission || !submission) return null;

    const status = submission.status;

    if (status === "REVIEW_ACC_DEPT_HEAD") {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          <button
            type="button"
            className={rejectButton}
            onClick={openRejectModal}
            disabled={processing}
          >
            Reject
          </button>
          <button
            type="button"
            className={revisionButton}
            onClick={openRevisionModal}
            disabled={processing}
          >
            Revision
          </button>
          <button
            type="button"
            className={primaryButton}
            onClick={() => handleGLAction("approve-acc-depthead")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve"}
          </button>
        </div>
      );
    }

    if (status === "APPROVED_ACC_DEPT_HEAD") {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          <button
            type="button"
            className={rejectButton}
            onClick={openRejectModal}
            disabled={processing}
          >
            Reject
          </button>
          <button
            type="button"
            className={primaryButton}
            onClick={() => handleGLAction("approve-accounting")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve"}
          </button>
        </div>
      );
    }

    if (status === "APPROVED_ACCOUNTING_HEAD") {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          <button
            type="button"
            className={rejectButton}
            onClick={openRejectModal}
            disabled={processing}
          >
            Reject
          </button>
          <button
            type="button"
            className={primaryButton}
            onClick={() => handleGLAction("approve-divhead")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve"}
          </button>
        </div>
      );
    }

    if (status === "APPROVED_DIV_HEAD") {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          <button
            type="button"
            className={primaryButton}
            onClick={() => handleGLAction("resolve")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Resolve"}
          </button>
        </div>
      );
    }

    return null;
  };

  return { handleGLAction, renderGLActionButtons };
}
