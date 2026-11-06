import { showNotification } from "../../utils/notification";
import { DEFAULT_USERID_FORM } from "../../components/sap-masterdata/forms/UserIdFormFields";

/* =========================================================
   USER ID APPROVAL CONFIGURATION
========================================================= */

export const userIdApproval = {
  getDefaultForm: () => DEFAULT_USERID_FORM,

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

  getResolveInfo(formData, submission) {
    const requestType =
      submission?.form_data?.requestType || formData.requestType;
    const code = String(formData.userIdCode).trim();
    if (requestType === "New" && !code)
      return { error: "The User ID Code is required." };
    return { code, isVendor: false, isMaterial: false, isUserId: true };
  },
};

/* =========================================================
   USER ID APPROVAL ACTIONS
========================================================= */

export function createUserIdActions(context) {
  const {
    approvalApi,
    isUserIdSubmission,
    submission,
    processing,
    setProcessing,
    setActionError,
    formLogic,
    formData,
    loadDetail,
    navigate,
    primaryButton,
    rejectButton,
    revisionButton,
    openRejectModal,
    openRevisionModal,
  } = context;

  const handleUserIdAction = async (action) => {
    if (!isUserIdSubmission) return;
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
            code: result.code,
            type: "userId",
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

      await loadDetail();
      navigate("/approval");
    } catch (err) {
      console.error(err);

      setActionError(err.response?.data?.message || "The action failed.");
    } finally {
      setProcessing(false);
    }
  };

  const renderUserIdActionButtons = () => {
    if (!isUserIdSubmission || !submission) return null;

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
            onClick={() => handleUserIdAction("approve-divhead")}
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
            type="submit"
            className={primaryButton}
            onClick={() => handleUserIdAction("resolve")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Resolve"}
          </button>
        </div>
      );
    }

    return null;
  };

  return { handleUserIdAction, renderUserIdActionButtons };
}
