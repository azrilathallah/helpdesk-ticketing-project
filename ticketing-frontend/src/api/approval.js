import api from "./axios";

export const approvalApi = {
  getAll: () => api.get("/approvals"),

  getById: (id) => api.get(`/approvals/${id}`),

  approveAccDeptHead: (id, notes = "") =>
    api.post(`/approvals/${id}/approve-acc-depthead`, {
      notes,
    }),

  approveDivHead: (id, notes = "") =>
    api.post(`/approvals/${id}/approve-divhead`, {
      notes,
    }),

  fillAccounting: (id, accountingData, notes = "") =>
    api.post(`/approvals/${id}/fill-accounting`, {
      accounting_data: accountingData,
      notes,
    }),

  approveAccountingHead: (id, notes = "") =>
    api.post(`/approvals/${id}/approve-accountinghead`, {
      notes,
    }),

  fillTax: (id, taxData, notes = "") =>
    api.post(`/approvals/${id}/fill-tax`, {
      tax_data: taxData,
      notes,
    }),

  approveTaxHead: (id, notes = "") =>
    api.post(`/approvals/${id}/approve-taxhead`, {
      notes,
    }),

  resolve: (id, code = "", notes = "", isVendor = false, isMaterial = false) =>
    api.post(`/approvals/${id}/resolve`, {
      ...(isMaterial
        ? { material_code: code }
        : isVendor
          ? { vendor_code: code }
          : { customer_code: code }),
      notes,
    }),

  cancel: (id, notes = "") =>
    api.post(`/approvals/${id}/cancel`, {
      notes,
    }),

  reject: (id, notes = "") =>
    api.post(`/approvals/${id}/reject`, {
      notes,
    }),

  revise: (id, notes = "") =>
    api.post(`/approvals/${id}/revise`, {
      notes,
    }),
};
