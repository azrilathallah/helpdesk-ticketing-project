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

  submitCr: (id, crData, notes = "") =>
    api.post(`/approvals/${id}/submit-cr`, {
      cr_data: crData,
      notes,
    }),

  approveRequestor: (id, notes = "") =>
    api.post(`/approvals/${id}/approve-requestor`, {
      notes,
    }),

  approveITSapHead: (id, notes = "") =>
    api.post(`/approvals/${id}/approve-itsaphead`, {
      notes,
    }),

  resolve: (id, { code = "", notes = "", solution = "", type = "customer" } = {}) => {
    const codeFields = {
      customer: "customer_code",
      vendor: "vendor_code",
      material: "material_code",
      userId: "userId_code",
    };

    const payload = {
      notes,
    };

    if (solution) {
      payload.solution = solution;
    }

    if (codeFields[type]) {
      payload[codeFields[type]] = code;
    }

    return api.post(`/approvals/${id}/resolve`, payload);
  },

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
