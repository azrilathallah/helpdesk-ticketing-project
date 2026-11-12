import { showNotification } from "../../../utils/notification";
import { DEFAULT_COSTPROFIT_FORM } from "../../../components/sap/CostProfitFormFields";

/* =========================================================
   COST PROFIT APPROVAL CONFIGURATION
========================================================= */

export const costProfitApproval = {
  getDefaultForm: () => DEFAULT_COSTPROFIT_FORM,

  getRole(status) {
    switch (status) {
      case "REVIEW_DIV_HEAD":
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
   COST PROFIT APPROVAL ACTIONS
========================================================= */

export function createCostProfitActions(context) {
  const {
    approvalApi,
    isCostProfitSubmission,
    submission,
    processing,
    setProcessing,
    setActionError,
    navigate,
    primaryButton,
    rejectButton,
    revisionButton,
    openRejectModal,
    openRevisionModal,
  } = context;

  const handleCostProfitAction = async (action) => {
    if (!isCostProfitSubmission) return;
    if (!submission || processing) return;

    try {
      setProcessing(true);
      setActionError("");

      let response;

      switch (action) {
        case "approve-divhead": {
          response = await approvalApi.approveDivHead(submission.id, "");
          break;
        }

        case "resolve": {
          response = await approvalApi.resolve(submission.id);

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

  const renderCostProfitActionButtons = () => {
    if (!isCostProfitSubmission || !submission) return null;

    const currentStatus = submission.status;

    if (currentStatus === "REVIEW_DIV_HEAD") {
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
            onClick={() => handleCostProfitAction("approve-divhead")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve"}
          </button>
        </div>
      );
    }

    if (["APPROVED_DIV_HEAD", "WAITING_PIC"].includes(currentStatus)) {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          <button
            type="button"
            className={primaryButton}
            onClick={() => handleCostProfitAction("resolve")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Resolve"}
          </button>
        </div>
      );
    }

    return null;
  };

  return { handleCostProfitAction, renderCostProfitActionButtons };
}
