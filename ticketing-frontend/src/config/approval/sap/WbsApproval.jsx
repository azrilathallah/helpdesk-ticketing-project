import { showNotification } from "../../../utils/notification";

/* =========================================================
   WBS APPROVAL CONFIGURATION
========================================================= */

export const wbsApproval = {
  getDefaultForm: () => ({}),

  getRole(status) {
    switch (status) {
      case "WAITING_PIC":
        return "pic";
      default:
        return null;
    }
  },

  getResolveInfo() {
    return {};
  },
};

/* =========================================================
   WBS APPROVAL ACTIONS
========================================================= */

export function createWbsActions(context) {
  const {
    approvalApi,
    isWbsSubmission,
    submission,
    processing,
    setProcessing,
    setActionError,
    formLogic,
    formData,
    navigate,
    primaryButton,
  } = context;

  const handleWbsAction = async (action) => {
    if (!isWbsSubmission) return;
    if (!submission || processing) return;

    try {
      setProcessing(true);
      setActionError("");

      let response;

      switch (action) {
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
            type: "wbs",
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

      navigate("/approval");
    } catch (err) {
      console.error(err);

      setActionError(err.response?.data?.message || "The action failed.");
    } finally {
      setProcessing(false);
    }
  };

  const renderWbsActionButtons = () => {
    if (!isWbsSubmission || !submission) return null;

    if (submission.status === "WAITING_PIC") {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          <button
            type="submit"
            className={primaryButton}
            onClick={() => handleWbsAction("resolve")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Resolve"}
          </button>
        </div>
      );
    }

    return null;
  };

  return { handleWbsAction, renderWbsActionButtons };
}

