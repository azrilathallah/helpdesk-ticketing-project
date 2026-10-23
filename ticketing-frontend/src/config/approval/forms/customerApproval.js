import { DEFAULT_CUSTOMER_FORM } from "../../../components/forms-sap-masterdata/customer/CustomerFormFields";

export const customerApproval = {
  getDefaultForm: () => DEFAULT_CUSTOMER_FORM,

  getRole(status) {
    switch (status) {
      case "REVIEW_DIV_HEAD":
        return "division_head";
      case "APPROVED_DIV_HEAD":
      case "REVISION_ACCOUNTING":
        return "accounting";
      case "APPROVED_ACCOUNTING":
      case "REVISION_TAX":
        return "tax";
      case "APPROVED_TAX":
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
    return (
      Boolean(
        data.accountGroup &&
        data.reconAccount &&
        data.sortKey &&
        data.toleranceGroup,
      ) || hasHistory
    );
  },

  getAccountingPayload(formData) {
    const payload = {
      accountGroup: formData.accountGroup || "",
      reconAccount: formData.reconAccount || "",
      sortKey: formData.sortKey || "",
      toleranceGroup: formData.toleranceGroup || "",
    };
    if (
      !payload.accountGroup ||
      !payload.reconAccount ||
      !payload.sortKey ||
      !payload.toleranceGroup
    ) {
      return { error: "Semua field Accounting wajib diisi sebelum disimpan." };
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
      return { error: "Pilih minimal satu withholding tax sebelum disimpan." };
    }

    return { payload: { witholdingTax } };
  },

  getResolveInfo(formData, submission) {
    const requestType =
      submission?.form_data?.requestType || formData.requestType;
    const code = String(formData.customerCode || "").trim();
    if (requestType === "New" && !code)
      return { error: "Customer Code wajib diisi." };
    return { code, isVendor: false, isMaterial: false };
  },
};
