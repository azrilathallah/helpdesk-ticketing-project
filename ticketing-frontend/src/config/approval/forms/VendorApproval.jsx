import { DEFAULT_VENDOR_FORM } from "../../../components/forms-sap-masterdata/vendor/VendorFormFields";

/* =========================================================
   VENDOR APPROVAL CONFIGURATION
========================================================= */

export const vendorApproval = {
  getDefaultForm: () => DEFAULT_VENDOR_FORM,

  getRole(status) {
    switch (status) {
      case "REVIEW_DIV_HEAD":
        return "division_head";
      case "APPROVED_DIV_HEAD":
      case "REVISION_ACCOUNTING":
        return "accounting";
      case "APPROVED_ACCOUNTING_HEAD":
      case "REVISION_TAX":
        return "tax";
      case "APPROVED_TAX_HEAD":
      case "WAITING_PIC":
        return "pic";
      default:
        return null;
    }
  },

  hasAccountingSaved(submission) {
    const data = submission?.form_data || {};
    const history = submission?.approval_history || [];
    const hasHistory = history.some(
      (item) =>
        ["ACCOUNTING_FILL", "ACCOUNTING_REFILLED"].includes(item.step) &&
        ["FILLED", "REFILLED"].includes(item.action),
    );
    const hasPaymentMethod =
      Array.isArray(data.paymentMethod) && data.paymentMethod.length > 0;
    return (
      (Boolean(data.accountGroup && data.reconAccount) && hasPaymentMethod) ||
      hasHistory
    );
  },

  getAccountingPayload(formData) {
    const payload = {
      accountGroup: formData.accountGroup || "",
      reconAccount: formData.reconAccount || "",
      paymentMethod: Array.isArray(formData.paymentMethod)
        ? formData.paymentMethod
        : [],
    };
    if (
      !payload.accountGroup ||
      !payload.reconAccount ||
      payload.paymentMethod.length === 0
    ) {
      return {
        error: "All Accounting fields must be filled in before saving.",
      };
    }
    return { payload };
  },

  hasTaxSaved(submission) {
    if (!submission) return false;

    const data = submission.form_data || {};
    const history = submission.approval_history || [];
    const hasHistory = history.some(
      (item) =>
        ["TAX_FILL", "TAX_REFILLED"].includes(item.step) &&
        ["FILLED", "REFILLED"].includes(item.action),
    );

    return (
      (Array.isArray(data.witholdingTax) && data.witholdingTax.length > 0) ||
      hasHistory
    );
  },

  getTaxPayload(formData) {
    const witholdingTax = Array.isArray(formData.witholdingTax)
      ? formData.witholdingTax
      : [];

    if (witholdingTax.length === 0) {
      return { error: "Select at least one withholding tax before saving." };
    }

    return { payload: { witholdingTax } };
  },

  getResolveInfo(formData, submission) {
    const requestType =
      submission?.form_data?.requestType || formData.requestType;
    const code = String(formData.vendorCode || "").trim();
    if (requestType === "New" && !code)
      return { error: "The Vendor Code is required." };
    return { code, isVendor: true, isMaterial: false };
  },
};

/* =========================================================
   VENDOR APPROVAL ACTIONS
========================================================= */

export function createVendorActions(context) {
  const {
    approvalApi,
    isVendorSubmission,
    submission,
    processing,
    setProcessing,
    setActionError,
    formLogic,
    formData,
    materialType,
    hasAccountingSaved,
    hasTaxSaved,
    loadDetail,
    navigate,
    primaryButton,
    rejectButton,
    revisionButton,
    openRejectModal,
    openRevisionModal,
  } = context;

  const handleVendorAction = async (action) => {
    if (!isVendorSubmission) return;
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

        case "fill-accounting": {
          const result = formLogic?.getAccountingPayload(
            formData,
            materialType,
          );

          if (!result) {
            setActionError(
              "The accounting rules for this form have not yet been configured.",
            );
            return;
          }

          if (result.error) {
            setActionError(result.error);
            return;
          }

          response = await approvalApi.fillAccounting(
            submission.id,
            result.payload,
            "",
          );
          break;
        }

        case "approve-accounting": {
          if (!hasAccountingSaved) {
            setActionError("Accounting data must be saved first.");
            return;
          }

          response = await approvalApi.approveAccountingHead(submission.id, "");
          break;
        }

        case "fill-tax": {
          const result = formLogic?.getTaxPayload(formData);

          if (!result) {
            setActionError("The tax rules for this form have not yet been configured.");
            return;
          }

          if (result.error) {
            setActionError(result.error);
            return;
          }

          response = await approvalApi.fillTax(
            submission.id,
            result.payload,
            "",
          );
          break;
        }

        case "approve-tax": {
          if (!hasTaxSaved) {
            setActionError("Tax data must be saved first.");
            return;
          }

          response = await approvalApi.approveTaxHead(submission.id, "");
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

          response = await approvalApi.resolve(
            submission.id,
            result.code,
            "",
            result.isVendor,
            result.isMaterial,
          );

          window.alert(
            response?.data?.message || "The request was successfully resolved.",
          );

          navigate("/approval");
          return;
        }

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

  const renderVendorActionButtons = () => {
    if (!isVendorSubmission || !submission) return null;

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
            onClick={() => handleVendorAction("approve-divhead")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve"}
          </button>
        </div>
      );
    }

    if (
      [
        "APPROVED_DIV_HEAD",
        "REVISION_ACCOUNTING",
        "REVIEW_ACCOUNTING_HEAD",
      ].includes(currentStatus)
    ) {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          {["APPROVED_DIV_HEAD", "REVISION_ACCOUNTING"].includes(
            currentStatus,
          ) && (
            <button
              type="submit"
              className={primaryButton}
              onClick={() => handleVendorAction("fill-accounting")}
              disabled={processing}
            >
              {processing ? "Saving..." : "Save"}
            </button>
          )}

          {currentStatus === "REVIEW_ACCOUNTING_HEAD" && (
            <>
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
                onClick={() => handleVendorAction("approve-accounting")}
                disabled={processing || !hasAccountingSaved}
              >
                {processing ? "Processing..." : "Approve"}
              </button>
            </>
          )}
        </div>
      );
    }

    if (
      ["APPROVED_ACCOUNTING_HEAD", "REVISION_TAX", "REVIEW_TAX_HEAD"].includes(
        currentStatus,
      )
    ) {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          {["APPROVED_ACCOUNTING_HEAD", "REVISION_TAX"].includes(
            currentStatus,
          ) && (
            <button
              type="submit"
              className={primaryButton}
              onClick={() => handleVendorAction("fill-tax")}
              disabled={processing}
            >
              {processing ? "Saving..." : "Save"}
            </button>
          )}

          {currentStatus === "REVIEW_TAX_HEAD" && (
            <>
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
                onClick={() => handleVendorAction("approve-tax")}
                disabled={processing || !hasTaxSaved}
              >
                {processing ? "Processing..." : "Approve"}
              </button>
            </>
          )}
        </div>
      );
    }

    if (["APPROVED_TAX_HEAD", "WAITING_PIC"].includes(currentStatus)) {
      return (
        <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
          <button
            type="submit"
            className={primaryButton}
            onClick={() => handleVendorAction("resolve")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Resolve"}
          </button>
        </div>
      );
    }

    return null;
  };

  return { handleVendorAction, renderVendorActionButtons };
}
