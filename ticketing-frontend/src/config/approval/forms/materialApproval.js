import { DEFAULT_MATERIAL_FORM } from "../../../components/forms-sap-masterdata/material/MaterialFormFields";

export const materialApproval = {
  getDefaultForm: () => DEFAULT_MATERIAL_FORM,

  getMaterialType(submission) {
    return String(submission?.form_data?.materialType || "")
      .trim()
      .toUpperCase();
  },

  getRole(status, materialType) {
    switch (status) {
      case "REVIEW_DIV_HEAD":
        return "division_head";
      case "APPROVED_DIV_HEAD":
      case "REVISION_ACCOUNTING":
        return ["YPRO", "ZCOM"].includes(materialType) ? "accounting" : "pic";
      case "APPROVED_ACCOUNTING":
      case "WAITING_PIC":
        return "pic";
      default:
        return null;
    }
  },

  hasAccountingSaved(submission, materialType) {
    const data = submission?.form_data || {};
    const history = submission?.approval_history || [];
    const hasHistory = history.some(
      (item) =>
        ["ACCOUNTING_FILL", "ACCOUNTING_REFILLED"].includes(item.step) &&
        ["FILLED", "REFILLED"].includes(item.action),
    );
    if (materialType === "YPRO")
      return Boolean(String(data.glAccount || "").trim()) && hasHistory;
    if (materialType === "ZCOM")
      return Boolean(String(data.reconAccount || "").trim()) && hasHistory;
    return false;
  },

  getAccountingPayload(formData, materialType) {
    if (materialType === "YPRO") {
      const glAccount = String(formData.glAccount || "").trim();
      return glAccount
        ? { payload: { glAccount } }
        : { error: "GL Account wajib diisi." };
    }
    if (materialType === "ZCOM") {
      const reconAccount = String(formData.reconAccount || "").trim();
      return reconAccount
        ? { payload: { reconAccount } }
        : { error: "Recon Account wajib diisi." };
    }
    return {
      error:
        "Pengisian Accounting Staff hanya diperlukan untuk Material YPRO dan ZCOM.",
    };
  },

  getResolveInfo(formData, submission) {
    const requestType =
      submission?.form_data?.requestType || formData.requestType;
    const code = String(formData.materialCode || "").trim();
    if (requestType === "New" && !code)
      return { error: "Material Code wajib diisi." };
    return { code, isVendor: false, isMaterial: true };
  },
};
