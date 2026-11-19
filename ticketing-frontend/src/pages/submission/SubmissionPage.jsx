import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showNotification, showConfirmation } from "../../utils/notification";

import { submissionApi } from "../../api/submission";
import FormRenderer from "../../components/FormRenderer";
import DataTable from "../../components/DataTable";

import { getUserValue } from "../../config/UserValue";
import {
  FileEdit,
  CheckCircle2,
  ArrowLeft,
  Clock,
  Check,
  AlertCircle,
  Hash,
  User,
} from "lucide-react";

/* =========================================================
   STATUS CONFIGURATION
========================================================= */

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    style: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  REVIEW_REQUESTOR: {
    label: "Needs Approval",
    style: "bg-sky-50 text-sky-700 ring-sky-200",
  },
  APPROVED_REQUESTOR: {
    label: "Approved by Requestor",
    style: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  REVIEW_ACC_DEPT_HEAD: {
    label: "Review Accounting Department Head",
    style: "bg-cyan-50 text-cyan-700 ring-cyan-200",
  },
  APPROVED_ACC_DEPT_HEAD: {
    label: "Approved by Accounting Department Head",
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
  REVIEW_IT_SAP_HEAD: {
    label: "Review IT-SAP Head",
    style: "bg-purple-50 text-purple-700 ring-purple-200",
  },
  APPROVED_IT_SAP_HEAD: {
    label: "Approved by IT-SAP Head",
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
  REVISION_PIC: {
    label: "Needs Revision - PIC",
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
    <main className="mx-auto w-full space-y-5">
      <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
          <p className="text-sm text-slate-500">{message}</p>
        </div>
      </div>
    </main>
  );
}

function ErrorPanel({ message, onBack, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-xs">
      <div className="flex gap-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600 ring-1 ring-red-100">
          <AlertCircle className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-slate-900">Something went wrong</h2>
          <p className="mt-1 wrap-break-word text-sm text-red-700">{message}</p>

          <div className="mt-5 flex flex-wrap gap-3">
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 sm:text-sm"
              >
                Try again
              </button>
            )}

            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 sm:text-sm"
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
        err.response?.data?.message || "Failed to load submission data.",
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

      if (
        submission.type === "SAP" &&
        submission.category === "Master Data" &&
        submission.sub_category === "User ID"
      ) {
        navigate(
          `/create-ticket/sap-masterdata/userid-form?submission=${submission.id}`,
        );
        return;
      }

      if (
        submission.type === "SAP" &&
        submission.category === "Master Data" &&
        submission.sub_category === "Cost Center and Profit Center"
      ) {
        navigate(
          `/create-ticket/sap-masterdata/costprofit-form?submission=${submission.id}`,
        );
        return;
      }

      if (
        submission.type === "SAP" &&
        submission.category === "Master Data" &&
        submission.sub_category === "WBS"
      ) {
        navigate(
          `/create-ticket/sap-masterdata/wbs-form?submission=${submission.id}`,
        );
        return;
      }
    }

    navigate(`/submission/${submission.id}`);
  };

  const handleCancelSubmission = async (submission, event) => {
    event?.stopPropagation();

    const confirmed = await showConfirmation({
      title: "Cancel Request?",
      text: `Are you sure you want to cancel request ${submission.number}?`,
      icon: "warning",
      confirmButtonText: "Yes, Cancel",
      cancelButtonText: "Keep Request",
      confirmButtonColor: "#dc2626",
    });

    if (!confirmed) return;

    try {
      const response = await submissionApi.cancel(
        submission.id,
        "Cancelled by requestor",
      );

      showNotification({
        icon: "success",
        title: "Cancelled",
        text: response?.data?.message || "Request has been cancelled.",
      });
      await loadSubmissions();
    } catch (err) {
      console.error(err);
      showNotification({
        icon: "error",
        title: "Failed",
        text: err.response?.data?.message || "Failed to cancel request.",
      });
    }
  };

  return (
    <main className="mx-auto w-full max-w-screen-2xl space-y-4">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
            My Submission
          </h1>
          <p className="mt-1 text-xs text-slate-500 sm:text-sm">
            View and manage all requests that you have created.
          </p>
        </div>
      </header>

      {/* Summary Cards */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4">
        <article className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 border-l-4 border-l-amber-500 bg-white p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-3.5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Draft
            </p>
            <p className="mt-1 text-sm font-extrabold tabular-nums tracking-tight text-amber-600 sm:text-xl">
              {loading ? "—" : totalDraft}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600 ring-1 ring-amber-100 transition-transform duration-200 group-hover:scale-110">
            <FileEdit className="h-5 w-5" />
          </div>
        </article>

        <article className="group flex items-center justify-between gap-3 rounded-2xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-3 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-3.5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Submitted
            </p>
            <p className="mt-1 text-sm font-extrabold tabular-nums tracking-tight text-emerald-600 sm:text-xl">
              {loading ? "—" : totalSubmitted}
            </p>
          </div>

          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100 transition-transform duration-200 group-hover:scale-110">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </article>
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
        throw new Error("Submission not found.");
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
          "Failed to load submission data.",
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
      nik: getUserValue(submission?.requestor, ["nik"]),
    }),
    [submission],
  );

  if (loading) {
    return <PageLoading message="Loading submission detail..." />;
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

  /* =========================================================
     APPROVAL HISTORY
  ========================================================= */

  const visibleHistory = (submission.approval_history || []).filter(
    (item) =>
      [
        "REQUESTOR_APPROVE",
        "IT_SAP_HEAD_APPROVE",
        "ACC_DEPT_HEAD_APPROVE",
        "DIV_HEAD_APPROVE",
        "ACCOUNTING_HEAD_APPROVE",
        "TAX_HEAD_APPROVE",
      ].includes(item.step) ||
      ["SOLVED", "REJECTED", "CANCELLED"].includes(item.action),
  );

  const getHistoryLabel = (item) => {
    if (item.step === "REQUESTOR_APPROVE") return "Approved by Requestor";
    if (item.step === "IT_SAP_HEAD_APPROVE") return "Approved by IT-SAP Head";
    if (item.step === "ACC_DEPT_HEAD_APPROVE")
      return "Approved by Accounting Department Head";
    if (item.step === "DIV_HEAD_APPROVE") return "Approved by Division Head";
    if (item.step === "ACCOUNTING_HEAD_APPROVE")
      return "Approved by Accounting Head";
    if (item.step === "TAX_HEAD_APPROVE") return "Approved by Tax Head";
    if (item.action === "SOLVED") return "Ticket Solved";
    if (item.action === "REJECTED") return "Ticket Rejected";
    if (item.action === "CANCELLED") return "Ticket Cancelled";

    return item.step || item.action || "Activity";
  };

  const isNegativeHistoryItem = (item) =>
    ["REJECTED", "CANCELLED"].includes(item.action);

  return (
    <main className="mx-auto w-full max-w-screen-2xl space-y-5">
      {/* Detail header */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <header className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => navigate("/submission")}
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                {submission.type} · {submission.category}
                {submission.sub_category &&
                String(submission.category).toLowerCase() !== "support"
                  ? ` · ${submission.sub_category}`
                  : ""}
              </p>

              <h1 className="mt-1.5 wrap-break-word text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {submission.category}
                {submission.sub_category &&
                String(submission.category).toLowerCase() !== "support"
                  ? ` ${submission.sub_category}`
                  : ""}{" "}
                Request
              </h1>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  Request Number:{" "}
                  <strong className="font-bold text-slate-900">
                    {submission.number || "-"}
                  </strong>
                </span>
              </div>
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
              status={submission.status}
              readOnly
              requestor={requestor}
              existingAttachments={submission.attachments || []}
            />
          </form>
        </div>
      </section>

      {/* Approval history */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-100 px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 ring-1 ring-blue-100">
              <Clock className="h-4 w-4" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Approval History
              </h2>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6">
          {visibleHistory.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-8 text-center">
              <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-400 ring-1 ring-slate-200">
                <Clock className="h-4 w-4" />
              </div>
              <p className="mt-2.5 text-xs font-semibold text-slate-700">
                No approval history yet
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
                    <div className="flex gap-3.5">
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ring-2 ring-white ${
                            negative
                              ? "bg-red-100 text-red-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {negative ? (
                            <AlertCircle className="h-3.5 w-3.5 stroke-[2.5]" />
                          ) : (
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                          )}
                        </div>

                        {index < visibleHistory.length - 1 && (
                          <div className="my-1 min-h-8 w-px flex-1 bg-slate-200" />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col justify-between gap-1 sm:flex-row sm:items-start">
                          <h3
                            className={`text-xs font-bold ${
                              negative ? "text-red-700" : "text-slate-900"
                            }`}
                          >
                            {getHistoryLabel(item)}
                          </h3>
                          <time className="shrink-0 text-[11px] font-medium text-slate-400">
                            {formatDate(item.created_at)}
                          </time>
                        </div>

                        <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500">
                          <User className="h-3 w-3 text-slate-400" />
                          <span>By: {item.actor?.name || "-"}</span>
                        </p>

                        {item.notes && (
                          <div className="mt-2 whitespace-pre-wrap wrap-break-word rounded-lg border border-slate-200/80 bg-slate-50 p-2.5 text-xs text-slate-700">
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
