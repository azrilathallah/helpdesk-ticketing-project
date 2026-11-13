import { showNotification } from "../../../utils/notification";
import { DEFAULT_SAP_SUPPORT_FORM } from "../../../components/sap/SapSupportFormFields";

/* =========================================================
   SAP SUPPORT APPROVAL CONFIGURATION
========================================================= */

export const sapSupportApproval = {
  getDefaultForm: () => DEFAULT_SAP_SUPPORT_FORM,

  getRole(status) {
    switch (status) {
      case "WAITING_PIC":
      case "REVISION_PIC":
      case "APPROVED_IT_SAP_HEAD":
        return "pic";
      case "REVIEW_REQUESTOR":
        return "requestor";
      case "APPROVED_REQUESTOR":
        return "division_head";
      case "APPROVED_DIV_HEAD":
        return "sap_head";
      default:
        return null;
    }
  },

  getCrPayload(formData) {
    const crData = formData?.crData || {};
    if (
      !String(crData.title).trim() ||
      !String(crData.targetDate).trim() ||
      !String(crData.crNumber).trim() ||
      !String(crData.implication).trim() ||
      !String(crData.priority).trim() ||
      !String(crData.currentProcess).trim() ||
      !String(crData.expectedProcess).trim() ||
      !String(crData.benefit).trim()
    ) {
      return {
        error:
          "All Change Request Form fields must be filled in before submitting.",
      };
    }

    return { payload: crData };
  },

  getResolveInfo(formData, submission) {
    const solution = String(formData?.solution ?? "").trim();
    const hasCrForm =
      Boolean(formData?.hasCrForm) ||
      submission?.status === "APPROVED_IT_SAP_HEAD";

    if (!hasCrForm && !solution) {
      return { error: "Solution explanation is required." };
    }

    return { solution };
  },
};

/* =========================================================
   SAP SUPPORT APPROVAL ACTIONS
========================================================= */

export function createSapSupportActions(context) {
  const {
    approvalApi,
    isSapSupportSubmission,
    submission,
    processing,
    setProcessing,
    setActionError,
    formLogic,
    formData,
    navigate,
    primaryButton,
    rejectButton,
    revisionButton,
    openRejectModal,
    openRevisionModal,
  } = context;

  const handleSapSupportAction = async (action) => {
    if (!isSapSupportSubmission) return;
    if (!submission || processing) return;

    try {
      setProcessing(true);
      setActionError("");

      let response;

      switch (action) {
        case "submit-cr": {
          const result = formLogic?.getCrPayload?.(formData);

          if (!result) {
            setActionError(
              "The Change Request rules for this form have not yet been configured.",
            );
            return;
          }

          if (result.error) {
            setActionError(result.error);
            return;
          }

          response = await approvalApi.submitCr(
            submission.id,
            result.payload,
            "",
          );
          break;
        }

        case "approve-requestor": {
          response = await approvalApi.approveRequestor(submission.id, "");
          break;
        }

        case "approve-divhead": {
          response = await approvalApi.approveDivHead(submission.id, "");
          break;
        }

        case "approve-itsaphead": {
          response = await approvalApi.approveITSapHead(submission.id, "");
          break;
        }

        case "resolve": {
          const result = formLogic?.getResolveInfo(formData, submission);

          if (!result) {
            setActionError(
              "The resolve rule for this form has not been configured.",
            );
            return;
          }

          if (result.error) {
            setActionError(result.error);
            return;
          }

          response = await approvalApi.resolve(submission.id, {
            solution: result.solution,
            type: "sapSupport",
          });

          showNotification({
            icon: "success",
            title: "Resolved",
            text:
              response?.data?.message ||
              "The request was successfully resolved.",
          });
          break;
        }

        default:
          return;
      }

      showNotification({
        icon: "success",
        title: "Success",
        text:
          response?.data?.message || "The action was successfully completed.",
      });

      navigate("/approval");
    } catch (err) {
      console.error(err);
      
      setActionError(err.response?.data?.message || "The action failed.");
    } finally {
      setProcessing(false);
    }
  };

  const renderSapSupportActionButtons = () => {
    if (!isSapSupportSubmission || !submission) return null;

    const currentStatus = submission.status;

    if (
      currentStatus === "REVISION_PIC" ||
      (currentStatus === "WAITING_PIC" && Boolean(formData?.hasCrForm))
    ) {
      return (
        <div className="mt-6 flex flex-row items-center justify-end gap-1.5 border-t border-slate-200 pt-4">
          <button
            type="submit"
            className={primaryButton}
            onClick={() => handleSapSupportAction("submit-cr")}
            disabled={processing}
          >
            {processing ? "Submitting..." : "Submit"}
          </button>
        </div>
      );
    }

    if (currentStatus === "WAITING_PIC") {
      return (
        <div className="mt-6 flex flex-row items-center justify-end gap-1.5 border-t border-slate-200 pt-4">
          <button
            type="button"
            className={rejectButton}
            onClick={openRejectModal}
            disabled={processing}
          >
            Reject
          </button>

          <button
            type="submit"
            className={primaryButton}
            onClick={() => handleSapSupportAction("resolve")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Resolve"}
          </button>
        </div>
      );
    }

    if (currentStatus === "REVIEW_REQUESTOR") {
      return (
        <div className="mt-6 flex flex-row items-center justify-end gap-1.5 border-t border-slate-200 pt-4">
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
            onClick={() => handleSapSupportAction("approve-requestor")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve"}
          </button>
        </div>
      );
    }

    if (["APPROVED_REQUESTOR", "REVIEW_DIV_HEAD"].includes(currentStatus)) {
      return (
        <div className="mt-6 flex flex-row items-center justify-end gap-1.5 border-t border-slate-200 pt-4">
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
            onClick={() => handleSapSupportAction("approve-divhead")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve"}
          </button>
        </div>
      );
    }

    if (["APPROVED_DIV_HEAD", "REVIEW_IT_SAP_HEAD"].includes(currentStatus)) {
      return (
        <div className="mt-6 flex flex-row items-center justify-end gap-1.5 border-t border-slate-200 pt-4">
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
            onClick={() => handleSapSupportAction("approve-itsaphead")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve"}
          </button>
        </div>
      );
    }

    if (currentStatus === "APPROVED_IT_SAP_HEAD") {
      return (
        <div className="mt-6 flex flex-row items-center justify-end gap-1.5 border-t border-slate-200 pt-4">
          <button
            type="submit"
            className={primaryButton}
            onClick={() => handleSapSupportAction("resolve")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Resolve"}
          </button>
        </div>
      );
    }

    return null;
  };

  return {
    handleSapSupportAction,
    renderSapSupportActionButtons,
  };
}
