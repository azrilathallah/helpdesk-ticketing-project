import { DEFAULT_VENDOR_FORM } from "../../../components/forms-sap-masterdata/vendor/VendorFormFields";

export const vendorApproval = {
  getDefaultForm: () => DEFAULT_VENDOR_FORM,

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
        error: "Semua field Accounting wajib diisi sebelum disimpan.",
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
      return { error: "Pilih minimal satu withholding tax sebelum disimpan." };
    }

    return { payload: { witholdingTax } };
  },

  getResolveInfo(formData, submission) {
    const requestType =
      submission?.form_data?.requestType || formData.requestType;
    const code = String(formData.vendorCode || "").trim();
    if (requestType === "New" && !code)
      return { error: "Vendor Code wajib diisi." };
    return { code, isVendor: true, isMaterial: false };
  },
};
