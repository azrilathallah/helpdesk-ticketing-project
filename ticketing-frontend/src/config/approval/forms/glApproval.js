import { DEFAULT_GL_FORM } from "../../../components/forms-sap-masterdata/gl/GLFormFields";

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

  canResolve(status) {
    return ["APPROVED_DIV_HEAD", "WAITING_PIC"].includes(status);
  },

  getResolveInfo() {
    return { code: "", isVendor: false, isMaterial: false };
  },
};
