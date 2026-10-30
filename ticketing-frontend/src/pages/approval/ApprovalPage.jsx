import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { approvalApi } from "../../api/approval";
import FormRenderer from "../../components/forms-sap-masterdata/FormRenderer";

import { getUserValue } from "../../config/UserValue";
import { getApprovalFormLogic } from "../../config/approval/forms";
import { createCustomerActions } from "../../config/approval/forms/CustomerApproval";
import { createVendorActions } from "../../config/approval/forms/VendorApproval";
import { createMaterialActions } from "../../config/approval/forms/MaterialApproval";
import { createGLActions } from "../../config/approval/forms/GLApproval";

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  REVIEW_ACC_DEPT_HEAD: {
    label: "Review Accounting Dept Head",
    style: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  APPROVED_ACC_DEPT_HEAD: {
    label: "Approved by Accounting Dept Head",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_DIV_HEAD: {
    label: "Review Division Head",
    style: "bg-blue-50 text-blue-700 ring-blue-200",
  },
  APPROVED_DIV_HEAD: {
    label: "Approved by Division Head",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_ACCOUNTING_HEAD: {
    label: "Review Accounting Head",
    style: "bg-indigo-50 text-indigo-700 ring-indigo-200",
  },
  APPROVED_ACCOUNTING_HEAD: {
    label: "Approved by Accounting Head",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_TAX_HEAD: {
    label: "Review Tax Head",
    style: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  APPROVED_TAX_HEAD: {
    label: "Approved by Tax Head",
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
    label: "Needs Revision - Requestor",
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

/* =========================================================
   SHARED COMPONENTS
========================================================= */

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
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
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

function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  error,
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-semibold text-slate-700">
        {label}
        <span className="text-red-500">*</span>
      </label>

      <textarea
        rows={3}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full resize-y rounded-lg border bg-white p-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
        }`}
      />

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function ApprovalPage() {
  const { id } = useParams();

  if (id) {
    return <ApprovalDetailPage id={id} />;
  }

  return <ApprovalList />;
}

/* =========================================================
   APPROVAL LIST
========================================================= */

function ApprovalList() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const loadApprovals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await approvalApi.getAll();
      setSubmissions(response.data?.data || []);
    } catch (err) {
      console.error(err);

      setError(err.response?.data?.message || "Gagal mengambil data approval.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const filteredSubmissions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return submissions.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.number?.toLowerCase().includes(keyword) ||
        item.form_type?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.sub_category?.toLowerCase().includes(keyword) ||
        item.requestor?.name?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  const handleOpen = (submission) => {
    if (!submission?.id) return;

    navigate(`/approval/${submission.id}`);
  };

  const inputClass =
    "min-h-8 w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <main className="mx-auto w-full space-y-3">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            Approval List
          </h1>

          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            View and process requests that require your approval.
          </p>
        </div>
      </header>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-2 sm:gap-4">
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-1.5 sm:p-3 shadow-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-lg text-blue-700">
            ✎
          </div>

          <div>
            <p className="text-sm font-medium text-slate-500">
              Pending Approval
            </p>

            <p className="text-lg font-bold tabular-nums text-slate-900">
              {submissions.length}
            </p>
          </div>
        </div>
      </section>

      {/* Approval List */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 p-4">
          <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Approval List
              </h2>

              <p className="text-xs text-slate-500">
                {filteredSubmissions.length} request
                {filteredSubmissions.length !== 1 ? "s" : ""} found
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-110 xl:grid-cols-[minmax(220px,1fr)_210px]">
              {/* Search */}
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                  ⌕
                </span>

                <input
                  type="search"
                  aria-label="Search approval"
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
                aria-label="Filter by status"
                className={inputClass}
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="ALL">All Status</option>
                <option value="REVIEW_ACC_DEPT_HEAD">
                  Review Accounting Dept Head
                </option>
                <option value="APPROVED_ACC_DEPT_HEAD">
                  Approved by Accounting Dept Head
                </option>
                <option value="REVIEW_DIV_HEAD">Review Division Head</option>
                <option value="APPROVED_DIV_HEAD">
                  Approved by Division Head
                </option>
                <option value="REVIEW_ACCOUNTING_HEAD">
                  Review Accounting Head
                </option>
                <option value="APPROVED_ACCOUNTING_HEAD">
                  Approved by Accounting Head
                </option>
                <option value="REVIEW_TAX_HEAD">Review Tax Head</option>
                <option value="APPROVED_TAX_HEAD">Approved by Tax Head</option>
                <option value="TICKET_SOLVED">Solved</option>
                <option value="TICKET_CANCELLED">Cancelled</option>
                <option value="TICKET_REJECTED">Rejected</option>
                <option value="REVISION_REQUESTOR">Requestor Revision</option>
                <option value="REVISION_ACCOUNTING">Accounting Revision</option>
                <option value="REVISION_TAX">Tax Revision</option>
              </select>
            </div>
          </div>
        </div>

        <div>
          {error && <ErrorPanel message={error} onRetry={loadApprovals} />}

          {loading && !error && (
            <PageLoading message="Please wait while approval data is being loaded." />
          )}

          {!loading && !error && filteredSubmissions.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-slate-200">
                📄
              </div>
              <h3 className="mt-4 font-semibold text-slate-900">
                {submissions.length === 0
                  ? "No approvals yet"
                  : "No matching approvals"}
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
                {submissions.length === 0
                  ? "There are no requests available for your approval."
                  : "Try changing your search keyword or filters."}
              </p>
            </div>
          )}

          {!error && filteredSubmissions.length > 0 && (
            <>
              {/* Desktop Table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full border-separate border-spacing-0 text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      {[
                        "Number",
                        "Request",
                        "Requestor",
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

                        <td className="border-b border-slate-100 p-3 text-xs text-slate-600">
                          {submission.requestor?.name || "-"}
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
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleOpen(submission);
                            }}
                            className="inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Review
                            <span aria-hidden="true">→</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
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
                      <p>Requestor: {submission.requestor?.name || "-"}</p>

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
                        Review
                      </button>
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
   APPROVAL DETAIL
========================================================= */

function ApprovalDetailPage({ id }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submission, setSubmission] = useState(null);
  const [formData, setFormData] = useState({});

  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState("");

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisionNotes, setRevisionNotes] = useState("");
  const [revisionError, setRevisionError] = useState("");

  const getDefaultForm = (data) => {
    return getApprovalFormLogic(data)?.getDefaultForm() || {};
  };

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await approvalApi.getById(id);
      const data = response.data?.data;

      if (!data) {
        throw new Error("Approval tidak ditemukan.");
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
          "Gagal mengambil detail approval.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  const isCustomerSubmission =
    String(submission?.sub_category || "").toLowerCase() === "customer";
  const isVendorSubmission =
    String(submission?.sub_category || "").toLowerCase() === "vendor";
  const isMaterialSubmission =
    String(submission?.sub_category || "").toLowerCase() === "material";
  const isGLSubmission =
    String(submission?.sub_category || "").toLowerCase() === "gl";

  const formLogic = getApprovalFormLogic(submission);
  const materialType = formLogic?.getMaterialType
    ? formLogic.getMaterialType(submission)
    : "";

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

  const approvalRole = useMemo(
    () => formLogic?.getRole(submission?.status, materialType) || null,
    [formLogic, submission?.status, materialType],
  );

  /* =========================================================
     ACCOUNTING / TAX SAVED
  ========================================================= */

  const hasAccountingSaved = useMemo(
    () =>
      typeof formLogic?.hasAccountingSaved === "function"
        ? formLogic.hasAccountingSaved(submission, materialType)
        : false,
    [formLogic, submission, materialType],
  );

  const hasTaxSaved = useMemo(
    () =>
      typeof formLogic?.hasTaxSaved === "function"
        ? formLogic.hasTaxSaved(submission)
        : false,
    [formLogic, submission],
  );

  /* =========================================================
     REJECT
  ========================================================= */

  const openRejectModal = () => {
    setRejectNotes("");
    setRejectError("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!submission || processing) return;

    if (!rejectNotes.trim()) {
      setRejectError("Catatan / alasan penolakan wajib diisi.");
      return;
    }

    try {
      setProcessing(true);
      setRejectError("");

      const response = await approvalApi.reject(
        submission.id,
        rejectNotes.trim(),
      );

      window.alert(response?.data?.message || "Submission berhasil di-reject.");

      setRejectModalOpen(false);
      setRejectNotes("");
      navigate("/approval");
    } catch (err) {
      console.error(err);

      setRejectError(
        err.response?.data?.message || "Gagal me-reject submission.",
      );
    } finally {
      setProcessing(false);
    }
  };

  /* =========================================================
     REVISION
  ========================================================= */

  const openRevisionModal = () => {
    setRevisionNotes("");
    setRevisionError("");
    setRevisionModalOpen(true);
  };

  const handleConfirmRevision = async () => {
    if (!submission || processing) return;

    if (!revisionNotes.trim()) {
      setRevisionError("Catatan revisi wajib diisi.");
      return;
    }

    try {
      setProcessing(true);
      setRevisionError("");

      const response = await approvalApi.revise(
        submission.id,
        revisionNotes.trim(),
      );

      window.alert(response?.data?.message || "Revisi berhasil dikirim.");

      setRevisionModalOpen(false);
      setRevisionNotes("");
      navigate("/approval");
    } catch (err) {
      console.error(err);

      setRevisionError(err.response?.data?.message || "Revisi gagal dikirim.");
    } finally {
      setProcessing(false);
    }
  };

  /* =========================================================
     ACTION BUTTONS
  ========================================================= */

  const primaryButton =
    "inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50";

  const secondaryButton =
    "inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50";

  const rejectButton =
    "inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50";

  const revisionButton =
    "inline-flex items-center justify-center rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50";

  const actionContext = {
    approvalApi,
    isCustomerSubmission,
    isVendorSubmission,
    isMaterialSubmission,
    isGLSubmission,
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
    secondaryButton,
    rejectButton,
    revisionButton,
    openRejectModal,
    openRevisionModal,
  };

  const customerActions = createCustomerActions(actionContext);
  const vendorActions = createVendorActions(actionContext);
  const materialActions = createMaterialActions(actionContext);
  const glActions = createGLActions(actionContext);

  const { renderCustomerActionButtons } = customerActions;
  const { renderVendorActionButtons } = vendorActions;
  const { renderMaterialActionButtons } = materialActions;
  const { renderGLActionButtons } = glActions;

  /* =========================================================
     LOADING / ERROR
  ========================================================= */

  if (loading) {
    return (
      <main className="mx-auto w-full space-y-5">
        <PageLoading message="Loading approval detail..." />
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full space-y-5">
        <ErrorPanel
          message={error}
          onRetry={loadDetail}
          onBack={() => navigate("/approval")}
        />
      </main>
    );
  }

  if (!submission) return null;

  /* =========================================================
     APPROVAL HISTORY
========================================================= */

  const visibleHistory = (submission.approval_history || []).filter(
    (item) =>
      [
        "ACC_DEPT_HEAD_APPROVE",
        "DIV_HEAD_APPROVE",
        "ACCOUNTING_HEAD_APPROVE",
        "TAX_HEAD_APPROVE",
        "ACC_DEPT_HEAD_REVISION",
        "ACCOUNTING_HEAD_REVISION",
        "DIV_HEAD_REVISION",
        "ACCOUNTING_REVISION",
        "TAX_REVISION",
      ].includes(item.step) ||
      ["SOLVED", "REJECTED", "CANCELLED"].includes(item.action),
  );

  const getHistoryLabel = (item) => {
    if (item.step === "ACC_DEPT_HEAD_APPROVE")
      return "Approved by Accounting Dept Head";
    if (item.step === "DIV_HEAD_APPROVE") return "Approved by Division Head";
    if (item.step === "ACCOUNTING_HEAD_APPROVE")
      return "Approved by Accounting Head";
    if (item.step === "TAX_HEAD_APPROVE") return "Approved by Tax Head";
    if (
      [
        "ACC_DEPT_HEAD_REVISION",
        "ACCOUNTING_HEAD_REVISION",
        "DIV_HEAD_REVISION",
      ].includes(item.step)
    ) {
      return "Requestor Revision";
    }
    if (item.step === "ACCOUNTING_REVISION") return "Accounting Revision";
    if (item.step === "TAX_REVISION") return "Tax Revision";
    if (item.action === "SOLVED") return "Ticket Solved";
    if (item.action === "REJECTED") return "Ticket Rejected";
    if (item.action === "CANCELLED") return "Ticket Cancelled";

    return item.step || item.action || "Activity";
  };

  const isNegativeHistoryItem = (item) =>
    ["REJECTED", "CANCELLED"].includes(item.action) ||
    [
      "ACC_DEPT_HEAD_REVISION",
      "ACCOUNTING_HEAD_REVISION",
      "DIV_HEAD_REVISION",
      "ACCOUNTING_REVISION",
      "TAX_REVISION",
    ].includes(item.step);

  /* =========================================================
     DETAIL PAGE
  ========================================================= */

  return (
    <main className="mx-auto w-full space-y-5">
      {/* Detail Card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => navigate("/approval")}
            disabled={processing}
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

        {/* Action Error */}
        {actionError && (
          <div className="mx-4 mt-4 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:mx-7">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold">
              !
            </span>

            <p className="min-w-0 flex-1 wrap-break-word">{actionError}</p>

            <button
              type="button"
              aria-label="Dismiss error"
              onClick={() => setActionError("")}
              className="rounded px-1 font-semibold text-red-500 hover:bg-red-100"
            >
              ×
            </button>
          </div>
        )}

        {/* Form */}
        <div className="p-4 sm:p-6">
          <form onSubmit={(event) => event.preventDefault()}>
            <FormRenderer
              type={submission.type}
              category={submission.category}
              subCategory={submission.sub_category}
              formData={formData}
              setFormData={setFormData}
              mode="approval"
              approvalRole={approvalRole}
              requestor={requestor}
              existingAttachments={submission.attachments || []}
              processing={processing}
            />

            {/* Approval Actions */}
            {isCustomerSubmission && renderCustomerActionButtons()}
            {isVendorSubmission && renderVendorActionButtons()}
            {isMaterialSubmission && renderMaterialActionButtons()}
            {isGLSubmission && renderGLActionButtons()}
          </form>
        </div>
      </section>

      {/* Approval History */}
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

                        <p className="text-xs text-slate-500">
                          By: {item.actor?.name || "-"}
                        </p>

                        {item.notes && (
                          <div className="mt-1 wrap-break-word whitespace-pre-wrap rounded-sm border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700">
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

      {/* =====================================================
          REJECT MODAL
      ===================================================== */}

      {rejectModalOpen && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !processing) {
              setRejectModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between px-4 py-3 sm:px-6 bg-red-500">
              <div>
                <h2
                  id="reject-modal-title"
                  className="text-sm font-semibold text-white"
                >
                  Reject Request
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setRejectModalOpen(false)}
                disabled={processing}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xl text-white transition hover:bg-red-300 hover:text-slate-700 disabled:opacity-50"
              >
                ×
              </button>
            </header>

            <div className="space-y-4 p-4 sm:p-6">
              <div className="rounded-sm border border-red-100 bg-red-50 p-2 text-xs text-red-700">
                Anda akan menolak ticket <strong>{submission.number}</strong>.
              </div>

              <TextareaField
                label="Catatan / Alasan Penolakan"
                value={rejectNotes}
                onChange={(event) => setRejectNotes(event.target.value)}
                placeholder="Tuliskan catatan alasan penolakan..."
                disabled={processing}
                error={rejectError}
              />
            </div>

            <footer className="flex gap-1.5 border-t border-slate-200 bg-slate-50 px-4 py-4 flex-row justify-end sm:px-6">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setRejectModalOpen(false)}
                disabled={processing}
              >
                Batal
              </button>

              <button
                type="button"
                className={rejectButton}
                onClick={handleConfirmReject}
                disabled={processing || !rejectNotes.trim()}
              >
                {processing ? "Memproses..." : "Konfirmasi Reject"}
              </button>
            </footer>
          </section>
        </div>
      )}

      {/* =====================================================
          REVISION MODAL
      ===================================================== */}

      {revisionModalOpen && (
        <div
          className="fixed inset-0 z-200 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-[2px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !processing) {
              setRevisionModalOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="revision-modal-title"
            className="my-auto w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between px-4 py-3 sm:px-6 bg-orange-500">
              <div>
                <h2
                  id="revision-modal-title"
                  className="text-sm font-semibold text-white"
                >
                  Revision
                </h2>
              </div>

              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setRevisionModalOpen(false)}
                disabled={processing}
                className="flex h-7 w-7 items-center justify-center rounded-lg text-xl text-white transition hover:bg-orange-300 hover:text-slate-700 disabled:opacity-50"
              >
                ×
              </button>
            </header>

            <div className="space-y-4 p-4 sm:p-6">
              <div className="rounded-lg border border-orange-100 bg-orange-50 p-2 text-xs text-orange-700">
                Catatan revisi akan membantu pihak terkait memperbaiki data
                sebelum proses approval dilanjutkan.
              </div>

              <TextareaField
                label="Catatan Revisi"
                value={revisionNotes}
                onChange={(event) => setRevisionNotes(event.target.value)}
                placeholder="Tuliskan data yang perlu diperbaiki..."
                disabled={processing}
                error={revisionError}
              />
            </div>

            <footer className="flex gap-1.5 border-t border-slate-200 bg-slate-50 px-4 py-4 flex-row justify-end sm:px-6">
              <button
                type="button"
                className={secondaryButton}
                onClick={() => setRevisionModalOpen(false)}
                disabled={processing}
              >
                Batal
              </button>

              <button
                type="button"
                className={revisionButton}
                onClick={handleConfirmRevision}
                disabled={processing || !revisionNotes.trim()}
              >
                {processing ? "Memproses..." : "Kirim Revisi"}
              </button>
            </footer>
          </section>
        </div>
      )}
    </main>
  );
}
