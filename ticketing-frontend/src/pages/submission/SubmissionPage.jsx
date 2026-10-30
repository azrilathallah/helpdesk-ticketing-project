import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { submissionApi } from "../../api/submission";
import FormRenderer from "../../components/forms-sap-masterdata/FormRenderer";
import DataTable from "../../components/DataTable";

import { getUserValue } from "../../config/UserValue";

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    style: "bg-slate-100 text-slate-700 ring-slate-200",
  },
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

      if (
        submission.type === "SAP" &&
        submission.category === "Master Data" &&
        submission.sub_category === "Material"
      ) {
        navigate(
          `/create-ticket/sap-masterdata/material-form?submission=${submission.id}`,
        );
        return;
      }

      if (
        submission.type === "SAP" &&
        submission.category === "Master Data" &&
        submission.sub_category === "GL"
      ) {
        navigate(
          `/create-ticket/sap-masterdata/gl-form?submission=${submission.id}`,
        );
        return;
      }
    }

    navigate(`/submission/${submission.id}`);
  };

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
        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-1 sm:p-2 shadow-sm">
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

        <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-1 sm:p-2 shadow-sm">
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
      <DataTable
        mode="submission"
        title="Submission List"
        submissions={submissions}
        loading={loading}
        error={error}
        onRetry={loadSubmissions}
        onOpen={handleOpen}
        onCancel={handleCancelSubmission}
      />
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
        "ACC_DEPT_HEAD_APPROVE",
        "DIV_HEAD_APPROVE",
        "ACCOUNTING_HEAD_APPROVE",
        "TAX_HEAD_APPROVE",
        "ACC_DEPT_HEAD_REVISION",
        "ACCOUNTING_HEAD_REVISION",
        "DIV_HEAD_REVISION",
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
    ].includes(item.step);

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

                        <p className="text-xs text-slate-500">
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
