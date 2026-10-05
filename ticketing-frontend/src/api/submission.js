import api from "./axios";

export const submissionApi = {
  getAll: () =>
    api.get("/submissions"),

  getById: (id) =>
    api.get(`/submissions/${id}`),

  create: (formData) =>
    api.post("/submissions", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  update: (id, formData) =>
    api.post(`/submissions/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  cancel: (id, notes = "") =>
    api.post(`/submissions/${id}/cancel`, { notes }),
};