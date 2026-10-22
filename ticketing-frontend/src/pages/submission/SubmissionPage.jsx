import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { submissionApi } from "../../api/submission";
import FormRenderer from "../../components/forms-sap-masterdata/FormRenderer";

import {
  DEFAULT_CUSTOMER_FORM,
  getUserValue,
} from "../../components/forms-sap-masterdata/customer/CustomerFormFields";
import { DEFAULT_VENDOR_FORM } from "../../components/forms-sap-masterdata/vendor/VendorFormFields";
import { DEFAULT_MATERIAL_FORM } from "../../components/forms-sap-masterdata/material/MaterialFormFields";

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    style: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  REVIEW_DIV_HEAD: {
    label: "Review by Division Head",
    style: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  APPROVED_DIV_HEAD: {
    label: "Approved by Division Head",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_ACCOUNTING: {
    label: "Review by Accounting",
    style: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  APPROVED_ACCOUNTING: {
    label: "Approved by Accounting",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_TAX: {
    label: "Review by Tax",
    style: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  APPROVED_TAX: {
    label: "Approved by Tax",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  WAITING_PIC: {
    label: "Waiting PIC",
    style: "bg-amber-50 text-amber-700 ring-amber-200",
  },
  TICKET_SOLVED: {
    label: "Ticket Solved",
    style: "bg-green-50 text-green-700 ring-green-200",
  },
  TICKET_CANCELLED: {
    label: "Ticket Cancelled",
    style: "bg-slate-100 text-slate-600 ring-slate-200",
  },
  TICKET_REJECTED: {
    label: "Ticket Rejected",
    style: "bg-red-50 text-red-700 ring-red-200",
  },
  REVISION_REQUESTOR: {
    label: "Needs Revision",
    style: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  REVISION_ACCOUNTING: {
    label: "Needs Revision - Accounting",
    style: "bg-orange-50 text-orange-700 ring-orange-200",
  },
  REVISION_TAX: {
    label: "Needs Revision - Tax",
    style: "bg-orange-50 text-orange-700 ring-orange-200",
  },
};

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "-",
      style: "bg-slate-100 text-slate-700 ring-slate-200",
    }
  );
}

function StatusBadge({ status }) {
  const config = getStatusConfig(status);

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-lg px-2 py-1 text-xs font-semibold ring-1 ring-inset ${config.style}`}
    >
      {config.label}
    </span>
  );
}

function formatDate(date) {
  if (!date) return "-";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "-";

  return parsedDate.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function PageLoading({ message = "Loading..." }) {
  return (
    <div className="flex min-h-64 items-center justify-center bg-white p-8">
      <div className="text-center">
        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        <p className="text-sm text-slate-500">{message}</p>
      </div>
    </div>
  );
}

function ErrorPanel({ message, onBack, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
          !
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-slate-900">Something went wrong</h2>
          <p className="mt-1 wrap-break-word text-sm text-red-700">{message}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Try again
              </button>
            )}

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Back
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SubmissionPage() {
  const { id } = useParams();

  if (id) {
    return <SubmissionDetailPage id={id} />;
  }

  return <SubmissionList />;
}

/* =========================================================
   MY SUBMISSION
========================================================= */

function SubmissionList() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const loadSubmissions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await submissionApi.getAll();
      setSubmissions(response.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal mengambil data submission.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  const totalDraft = submissions.filter(
    (item) => item.status === "DRAFT",
  ).length;

  const totalSubmitted = submissions.filter(
    (item) =>
      item.status !== "DRAFT" &&
      item.status !== "TICKET_CANCELLED" &&
      item.status !== "TICKET_REJECTED",
  ).length;

  const filteredSubmissions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return submissions.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.number?.toLowerCase().includes(keyword) ||
        item.form_type?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.sub_category?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesType = typeFilter === "ALL" || item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [submissions, search, statusFilter, typeFilter]);

  const handleOpen = (submission) => {
    const editableStatuses = ["DRAFT", "REVISION_REQUESTOR"];

    if (editableStatuses.includes(submission.status)) {
      if (
        submission.type === "SAP" &&
        submission.category === "Master Data" &&
        submission.sub_category === "Customer"
      ) {
        navigate(
          `/create-ticket/sap-masterdata/customer-form?submission=${submission.id}`,
        );
        return;
      }

      if (
        submission.type === "SAP" &&
        submission.category === "Master Data" &&
        submission.sub_category === "Vendor"
      ) {
        navigate(
          `/create-ticket/sap-masterdata/vendor-form?submission=${submission.id}`,
        );
        return;
      }
    }

    navigate(`/submission/${submission.id}`);
  };

  const canCancel = (status) =>
    !["TICKET_SOLVED", "TICKET_CANCELLED", "TICKET_REJECTED"].includes(status);

  const handleCancelSubmission = async (submission, event) => {
    event?.stopPropagation();

    const confirmed = window.confirm(
      `Apakah Anda yakin ingin membatalkan ticket ${submission.number}?`,
    );

    if (!confirmed) return;

    try {
      const response = await submissionApi.cancel(
        submission.id,
        "Dibatalkan oleh requestor",
      );

      window.alert(response?.data?.message || "Ticket berhasil dibatalkan.");
      await loadSubmissions();
    } catch (err) {
      console.error(err);
      window.alert(err.response?.data?.message || "Gagal membatalkan tiket.");
    }
  };

  const inputClass =
    "min-h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="mx-auto w-full space-y-3">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            My Submission
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            View and manage all requests that you have created.
          </p>
        </div>
      </header>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-1.5 sm:p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-lg text-amber-700">
            ✎
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Draft</p>
            <p className="text-lg font-bold tabular-nums text-slate-900">
              {totalDraft}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-1.5 sm:p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-lg text-emerald-700">
            ✓
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Submitted</p>
            <p className="text-lg font-bold tabular-nums text-slate-900">
              {totalSubmitted}
            </p>
          </div>
        </div>
      </section>

      {/* Submission List */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Submission List
              </h2>
              <p className="text-xs text-slate-500">
                {filteredSubmissions.length} request
                {filteredSubmissions.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-150 xl:grid-cols-[minmax(220px,1fr)_140px_210px]">
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  ⌕
                </span>

                <input
                  type="search"
                  aria-label="Search submission"
                  placeholder="Search number or form..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className={`${inputClass} pl-9`}
                />

                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-700"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <select
                aria-label="Filter by type"
                className={inputClass}
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
              >
                <option value="ALL">All Type</option>
                <option value="SAP">SAP</option>
                <option value="IT">IT</option>
              </select>

              <select
                aria-label="Filter by status"
                className={inputClass}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="REVIEW_DIV_HEAD">Review by Division Head</option>
                <option value="APPROVED_DIV_HEAD">
                  Approved by Division Head
                </option>
                <option value="REVIEW_ACCOUNTING">Review by Accounting</option>
                <option value="APPROVED_ACCOUNTING">
                  Approved by Accounting
                </option>
                <option value="REVIEW_TAX">Review by Tax</option>
                <option value="APPROVED_TAX">Approved by Tax</option>
                {/* <option value="WAITING_PIC">Waiting PIC</option> */}
                <option value="TICKET_SOLVED">Solved</option>
                <option value="TICKET_CANCELLED">Cancelled</option>
                <option value="TICKET_REJECTED">Rejected</option>
                <option value="REVISION_REQUESTOR">Requestor Revision</option>
                {/* <option value="REVISION_ACCOUNTING">Accounting Revision</option>
                <option value="REVISION_TAX">Tax Revision</option> */}
              </select>
            </div>
          </div>
        </div>

        <div>
          {error && <ErrorPanel message={error} onRetry={loadSubmissions} />}

          {loading && !error && (
            <PageLoading message="Please wait while submission data is being loaded." />
          )}

          {!loading && !error && filteredSubmissions.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-slate-200">
                📄
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                {submissions.length === 0
                  ? "No submissions yet"
                  : "No matching submissions"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {submissions.length === 0
                  ? "Your saved drafts and submitted requests will appear here."
                  : "Try changing your search keyword or filters."}
              </p>
            </div>
          )}

          {!error && filteredSubmissions.length > 0 && (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-separate border-spacing-0 text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      {[
                        "Number",
                        "Request",
                        "Created",
                        "Status",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="border-b border-slate-200 p-3 text-xs font-bold uppercase tracking-wider text-slate-500 first:rounded-tl-lg last:rounded-tr-lg"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredSubmissions.map((submission) => (
                      <tr
                        key={submission.id}
                        onClick={() => handleOpen(submission)}
                        className="cursor-pointer transition hover:bg-blue-50/40"
                      >
                        <td className="border-b border-slate-100 p-3">
                          <span className="text-xs font-semibold text-blue-700">
                            {submission.number || "-"}
                          </span>
                        </td>

                        <td className="border-b border-slate-100 p-3">
                          <p className="text-xs font-medium text-slate-800">
                            {submission.form_type ||
                              `${submission.category || ""} ${submission.sub_category || ""}`}
                          </p>
                        </td>

                        <td className="whitespace-nowrap border-b border-slate-100 p-3 text-xs text-slate-600">
                          {formatDate(
                            submission.submitted_at || submission.created_at,
                          )}
                        </td>

                        <td className="border-b border-slate-100 p-3">
                          <StatusBadge status={submission.status} />
                        </td>

                        <td className="border-b border-slate-100 p-3">
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                handleOpen(submission);
                              }}
                              className="inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                            >
                              {["DRAFT", "REVISION_REQUESTOR"].includes(
                                submission.status,
                              )
                                ? "Edit"
                                : "View"}
                              <span aria-hidden="true">→</span>
                            </button>

                            {canCancel(submission.status) && (
                              <button
                                type="button"
                                onClick={(event) =>
                                  handleCancelSubmission(submission, event)
                                }
                                className="rounded-sm border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="grid grid-cols-1 md:hidden">
                {filteredSubmissions.map((submission) => (
                  <article
                    key={submission.id}
                    className="border border-slate-300 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="wrap-break-word text-sm font-semibold text-blue-700">
                          {submission.number || "-"}
                        </p>
                        <h3 className="mt-1 wrap-break-word text-sm font-semibold text-slate-900">
                          {submission.form_type ||
                            `${submission.category || ""} ${submission.sub_category || ""}`}
                        </h3>
                      </div>
                      <StatusBadge status={submission.status} />
                    </div>

                    <div className="mt-1 space-y-1 text-xs text-slate-500">
                      <p>
                        Created:{" "}
                        {formatDate(
                          submission.submitted_at || submission.created_at,
                        )}
                      </p>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-2 border-t border-slate-300 pt-3 items-center justify-end">
                      <button
                        type="button"
                        onClick={() => handleOpen(submission)}
                        className="rounded-lg bg-blue-600 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        {["DRAFT", "REVISION_REQUESTOR"].includes(
                          submission.status,
                        )
                          ? "Edit Submission"
                          : "View Details"}
                      </button>

                      {canCancel(submission.status) && (
                        <button
                          type="button"
                          onClick={(event) =>
                            handleCancelSubmission(submission, event)
                          }
                          className="rounded-lg border border-red-200 px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   SUBMISSION DETAIL
========================================================= */

function SubmissionDetailPage({ id }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState({});

  const getDefaultForm = (data) => {
    if (data?.sub_category === "Customer") {
      return DEFAULT_CUSTOMER_FORM;
    }

    if (data?.sub_category === "Vendor") {
      return DEFAULT_VENDOR_FORM;
    }

    if (data?.sub_category === "Material") {
      return DEFAULT_MATERIAL_FORM;
    }

    return {};
  };

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await submissionApi.getById(id);
      const data = response.data?.data;

      if (!data) {
        throw new Error("Submission tidak ditemukan.");
      }

      setSubmission(data);

      setFormData({
        ...getDefaultForm(data),
        ...(data.form_data || {}),
      });
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Gagal mengambil detail submission.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const requestor = useMemo(
    () => ({
      name: getUserValue(submission?.requestor, ["name"]),
      position: getUserValue(submission?.requestor, ["position"]),
      division: getUserValue(submission?.requestor, ["division"]),
      department: getUserValue(submission?.requestor, ["department"]),
      telephone: getUserValue(submission?.requestor, ["telephone"]),
      email: getUserValue(submission?.requestor, ["email"]),
    }),
    [submission],
  );

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-300">
        <PageLoading message="Loading submission detail..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-300">
        <ErrorPanel
          message={error}
          onRetry={loadDetail}
          onBack={() => navigate("/submission")}
        />
      </main>
    );
  }

  if (!submission) return null;

  const visibleHistory = (submission.approval_history || []).filter(
    (item) =>
      [
        "DIV_HEAD_APPROVE",
        "ACCOUNTING_APPROVE",
        "TAX_APPROVE",
        "DIV_HEAD_REVISION",
      ].includes(item.step) ||
      ["SOLVED", "REJECTED", "CANCELLED"].includes(item.action),
  );

  const getHistoryLabel = (item) => {
    if (item.step === "DIV_HEAD_APPROVE") return "Approved by Division Head";
    if (item.step === "ACCOUNTING_APPROVE") return "Approved by Accounting";
    if (item.step === "TAX_APPROVE") return "Approved by Tax";
    if (item.step === "DIV_HEAD_REVISION") return "Requestor Revision";
    if (item.action === "SOLVED") return "Ticket Solved";
    if (item.action === "REJECTED") return "Ticket Rejected";
    if (item.action === "CANCELLED") return "Ticket Cancelled";

    return item.step || item.action || "Activity";
  };

  const isNegativeHistoryItem = (item) =>
    ["REJECTED", "CANCELLED"].includes(item.action) ||
    item.step === "DIV_HEAD_REVISION";

  return (
    <main className="mx-auto w-full space-y-5">
      {/* Detail header */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => navigate("/submission")}
            className="mb-2 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <span aria-hidden="true">←</span>
            Back
          </button>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                {submission.type} · {submission.category} ·{" "}
                {submission.sub_category}
              </p>

              <h1 className="mt-2 wrap-break-word text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {submission.category} {submission.sub_category} Request
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                Request Number: {submission.number || "-"}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={submission.status} />
            </div>
          </div>
        </header>

        {/* Form */}
        <div className="p-4 sm:p-6">
          <form onSubmit={(event) => event.preventDefault()}>
            <FormRenderer
              type={submission.type}
              category={submission.category}
              subCategory={submission.sub_category}
              formData={formData}
              setFormData={setFormData}
              mode="submission"
              readOnly
              requestor={requestor}
              existingAttachments={submission.attachments || []}
            />
          </form>
        </div>
      </section>

      {/* Approval history */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">
              ◷
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Approval History
              </h2>
            </div>
          </div>
        </div>

        <div className="p-4 sm:px-6">
          {visibleHistory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
              <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-white text-lg ring-1 ring-slate-200">
                ◷
              </div>
              <p className="mt-2 text-xs font-medium text-slate-700">
                Belum ada riwayat approval
              </p>
            </div>
          ) : (
            <ol className="space-y-0">
              {visibleHistory.map((item, index) => {
                const negative = isNegativeHistoryItem(item);

                return (
                  <li
                    key={item.id ?? `${item.step}-${item.created_at}-${index}`}
                  >
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                            negative
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {negative ? "!" : "✓"}
                        </div>

                        {index < visibleHistory.length - 1 && (
                          <div className="my-1 min-h-8 w-px flex-1 bg-slate-200" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1 pb-3">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                          <h3
                            className={`text-xs font-semibold ${
                              negative ? "text-red-700" : "text-slate-900"
                            }`}
                          >
                            {getHistoryLabel(item)}
                          </h3>
                          <time className="shrink-0 text-xs text-slate-500">
                            {formatDate(item.created_at)}
                          </time>
                        </div>

                        <p className="mt-1 text-xs text-slate-500">
                          By: {item.actor?.name || "-"}
                        </p>

                        {item.notes && (
                          <div className="mt-1 whitespace-pre-wrap wrap-break-word rounded-sm border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700">
                            {item.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </section>
    </main>
  );
}
