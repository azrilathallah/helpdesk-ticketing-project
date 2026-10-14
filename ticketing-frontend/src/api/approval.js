import api from "./axios";

export const approvalApi = {
  getAll: () => api.get("/approvals"),

  getById: (id) => api.get(`/approvals/${id}`),

  approveDivHead: (id, notes = "") =>
    api.post(`/approvals/${id}/approve-divhead`, {
      notes,
    }),

  fillAccounting: (id, accountingData, notes = "") =>
    api.post(`/approvals/${id}/fill-accounting`, {
      accounting_data: accountingData,
      notes,
    }),

  approveAccounting: (id, notes = "") =>
    api.post(`/approvals/${id}/approve-accounting`, {
      notes,
    }),

  fillTax: (id, taxData, notes = "") =>
    api.post(`/approvals/${id}/fill-tax`, {
      tax_data: taxData,
      notes,
    }),

  approveTax: (id, notes = "") =>
    api.post(`/approvals/${id}/approve-tax`, {
      notes,
    }),

  resolve: (id, code = "", notes = "", isVendor = false) =>
    api.post(`/approvals/${id}/resolve`, {
      ...(isVendor ? { vendor_code: code } : { customer_code: code }),
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
