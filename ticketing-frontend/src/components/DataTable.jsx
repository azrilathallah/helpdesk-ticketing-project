import React, { useMemo, useState } from "react";

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

function ErrorPanel({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 font-bold text-red-700">
          !
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-slate-900">Something went wrong</h2>
          <p className="mt-1 wrap-break-word text-sm text-red-700">{message}</p>

          {onRetry && (
            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={onRetry}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   DATA TABLE (SUBMISSION & APPROVAL)
========================================================= */

export default function DataTable({
  mode = "submission",
  title,
  submissions = [],
  loading = false,
  error = "",
  onRetry,
  onOpen,
  onCancel,
}) {
  const isApproval = mode === "approval";

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [sortConfig, setSortConfig] = useState({
    key: "created",
    direction: "desc",
  });
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);

  const filteredSubmissions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return submissions.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.number?.toLowerCase().includes(keyword) ||
        item.form_type?.toLowerCase().includes(keyword) ||
        item.category?.toLowerCase().includes(keyword) ||
        item.sub_category?.toLowerCase().includes(keyword) ||
        (isApproval && item.requestor?.name?.toLowerCase().includes(keyword));

      const matchesStatus =
        statusFilter === "ALL" || item.status === statusFilter;

      const matchesType =
        isApproval || typeFilter === "ALL" || item.type === typeFilter;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [submissions, search, statusFilter, typeFilter, isApproval]);

  const sortedSubmissions = useMemo(() => {
    const items = [...filteredSubmissions];
    if (!sortConfig.key) return items;

    const getSortValue = (item) => {
      switch (sortConfig.key) {
        case "number":
          return item.number || "";
        case "request":
          return (
            item.form_type ||
            `${item.category || ""} ${item.sub_category || ""}`.trim()
          );
        case "requestor":
          return item.requestor?.name || "";
        case "created": {
          const time = new Date(item.submitted_at || item.created_at).getTime();
          return Number.isNaN(time) ? 0 : time;
        }
        case "status":
          return getStatusConfig(item.status).label || "";
        default:
          return "";
      }
    };

    items.sort((a, b) => {
      const aValue = getSortValue(a);
      const bValue = getSortValue(b);

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortConfig.direction === "asc"
          ? aValue - bValue
          : bValue - aValue;
      }

      const comparison = String(aValue).localeCompare(String(bValue), "id", {
        numeric: true,
        sensitivity: "base",
      });

      return sortConfig.direction === "asc" ? comparison : -comparison;
    });

    return items;
  }, [filteredSubmissions, sortConfig]);

  const totalItems = sortedSubmissions.length;
  const effectiveLimit =
    limit === "ALL" ? Math.max(1, totalItems) : Number(limit);
  const totalPages = Math.max(1, Math.ceil(totalItems / effectiveLimit));
  const currentPage = Math.min(page, totalPages);

  const displayedSubmissions = useMemo(() => {
    if (limit === "ALL") return sortedSubmissions;
    const start = (currentPage - 1) * effectiveLimit;
    return sortedSubmissions.slice(start, start + effectiveLimit);
  }, [sortedSubmissions, limit, currentPage, effectiveLimit]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const canCancel = (status) =>
    !["TICKET_SOLVED", "TICKET_CANCELLED", "TICKET_REJECTED"].includes(status);

  const columns = isApproval
    ? [
        { label: "Number", key: "number" },
        { label: "Request", key: "request" },
        { label: "Requestor", key: "requestor" },
        { label: "Created", key: "created" },
        { label: "Status", key: "status" },
        { label: "Actions", key: null },
      ]
    : [
        { label: "Number", key: "number" },
        { label: "Request", key: "request" },
        { label: "Created", key: "created" },
        { label: "Status", key: "status" },
        { label: "Actions", key: null },
      ];

  const inputClass =
    "min-h-8 w-full rounded-lg border border-slate-300 bg-white p-1 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-col justify-between gap-4 xl:flex-row xl:items-center">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              {title || (isApproval ? "Approval List" : "Submission List")}
            </h2>
            <p className="text-xs text-slate-500">
              {filteredSubmissions.length} request
              {filteredSubmissions.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div
            className={
              isApproval
                ? "grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-130 xl:grid-cols-[minmax(220px,1fr)_210px_50px]"
                : "grid grid-cols-1 gap-2 sm:grid-cols-2 xl:w-160 xl:grid-cols-[minmax(220px,1fr)_100px_210px_50px]"
            }
          >
            {/* Search */}
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-slate-400">
                ⌕
              </span>

              <input
                type="search"
                aria-label={`Search ${isApproval ? "approval" : "submission"}`}
                placeholder="Search number or form..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className={`${inputClass} pl-9`}
              />

              
            </div>

            {/* Type Filter (Submission) */}
            {!isApproval && (
              <select
                aria-label="Filter by type"
                className={inputClass}
                value={typeFilter}
                onChange={(event) => {
                  setTypeFilter(event.target.value);
                  setPage(1);
                }}
              >
                <option value="ALL">All Type</option>
                <option value="SAP">SAP</option>
                <option value="IT">IT</option>
              </select>
            )}

            {/* Status Filter */}
            <select
              aria-label="Filter by status"
              className={inputClass}
              value={statusFilter}
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All Status</option>
              {!isApproval && <option value="DRAFT">Draft</option>}
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
              <option value="REVISION_REQUESTOR">
                {isApproval ? "Requestor Revision" : "Needs Revision"}
              </option>
              {isApproval && (
                <>
                  <option value="REVISION_ACCOUNTING">
                    Accounting Revision
                  </option>
                  <option value="REVISION_TAX">Tax Revision</option>
                </>
              )}
            </select>

            {/* Limit Filter */}
            <select
              aria-label="Rows per page"
              className={inputClass}
              value={limit}
              onChange={(event) => {
                const val = event.target.value;
                setLimit(val === "ALL" ? "ALL" : Number(val));
                setPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value="ALL">All</option>
            </select>
          </div>
        </div>
      </div>

      <div>
        {error && <ErrorPanel message={error} onRetry={onRetry} />}

        {loading && !error && (
          <PageLoading
            message={`Please wait while ${isApproval ? "approval" : "submission"} data is being loaded.`}
          />
        )}

        {!loading && !error && filteredSubmissions.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-5 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-sm ring-1 ring-slate-200">
              📄
            </div>
            <h3 className="mt-4 font-semibold text-slate-900">
              {submissions.length === 0
                ? isApproval
                  ? "No approvals yet"
                  : "No submissions yet"
                : isApproval
                  ? "No matching approvals"
                  : "No matching submissions"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
              {submissions.length === 0
                ? isApproval
                  ? "There are no requests available for your approval."
                  : "Your saved drafts and submitted requests will appear here."
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
                    {columns.map((heading) => (
                      <th
                        key={heading.label}
                        onClick={() => heading.key && handleSort(heading.key)}
                        className={`border-b border-slate-200 p-3 text-xs font-bold uppercase tracking-wider text-slate-500 first:rounded-tl-lg last:rounded-tr-lg ${
                          heading.key
                            ? "cursor-pointer select-none transition hover:bg-slate-100 hover:text-slate-800"
                            : ""
                        }`}
                      >
                        <div className="inline-flex items-center gap-1.5">
                          <span>{heading.label}</span>
                          {heading.key && (
                            <span className="flex flex-col text-[8px] leading-2">
                              <span
                                className={
                                  sortConfig.key === heading.key &&
                                  sortConfig.direction === "asc"
                                    ? "text-blue-600"
                                    : "text-slate-300"
                                }
                              >
                                ▲
                              </span>
                              <span
                                className={
                                  sortConfig.key === heading.key &&
                                  sortConfig.direction === "desc"
                                    ? "text-blue-600"
                                    : "text-slate-300"
                                }
                              >
                                ▼
                              </span>
                            </span>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {displayedSubmissions.map((submission) => (
                    <tr
                      key={submission.id}
                      onClick={() => onOpen?.(submission)}
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

                      {isApproval && (
                        <td className="border-b border-slate-100 p-3 text-xs text-slate-600">
                          {submission.requestor?.name || "-"}
                        </td>
                      )}

                      <td className="whitespace-nowrap border-b border-slate-100 p-3 text-xs text-slate-600">
                        {formatDate(
                          submission.submitted_at || submission.created_at,
                        )}
                      </td>

                      <td className="border-b border-slate-100 p-3">
                        <StatusBadge status={submission.status} />
                      </td>

                      <td className="border-b border-slate-100 p-3">
                        {isApproval ? (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              onOpen?.(submission);
                            }}
                            className="inline-flex items-center gap-1 rounded-sm border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            Review
                            <span aria-hidden="true">→</span>
                          </button>
                        ) : (
                          <div className="flex flex-wrap items-center gap-2">
                            <button
                              type="button"
                              onClick={(event) => {
                                event.stopPropagation();
                                onOpen?.(submission);
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

                            {onCancel && canCancel(submission.status) && (
                              <button
                                type="button"
                                onClick={(event) => onCancel(submission, event)}
                                className="rounded-sm border border-red-200 bg-white px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="grid grid-cols-1 md:hidden">
              {displayedSubmissions.map((submission) => (
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
                    {isApproval && (
                      <p>Requestor: {submission.requestor?.name || "-"}</p>
                    )}
                    <p>
                      Created:{" "}
                      {formatDate(
                        submission.submitted_at || submission.created_at,
                      )}
                    </p>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-300 pt-3">
                    {isApproval ? (
                      <button
                        type="button"
                        onClick={() => onOpen?.(submission)}
                        className="rounded-lg bg-blue-600 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                      >
                        Review
                      </button>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => onOpen?.(submission)}
                          className="rounded-lg bg-blue-600 px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-blue-700"
                        >
                          {["DRAFT", "REVISION_REQUESTOR"].includes(
                            submission.status,
                          )
                            ? "Edit Submission"
                            : "View Details"}
                        </button>

                        {onCancel && canCancel(submission.status) && (
                          <button
                            type="button"
                            onClick={(event) => onCancel(submission, event)}
                            className="rounded-lg border border-red-200 px-2.5 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-semibold text-slate-700">
                  {limit === "ALL" ? 1 : (currentPage - 1) * effectiveLimit + 1}
                </span>
                –
                <span className="font-semibold text-slate-700">
                  {limit === "ALL"
                    ? totalItems
                    : Math.min(currentPage * effectiveLimit, totalItems)}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-slate-700">
                  {totalItems}
                </span>
              </p>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={() => setPage(currentPage - 1)}
                  aria-label="Previous page"
                  className="min-w-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ‹
                </button>

                {(() => {
                  const pages = [];
                  const from = Math.max(
                    1,
                    Math.min(currentPage - 2, totalPages - 4),
                  );
                  const to = Math.min(totalPages, from + 4);
                  for (let i = from; i <= to; i += 1) pages.push(i);
                  return pages.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPage(p)}
                      aria-current={p === currentPage ? "page" : undefined}
                      className={
                        p === currentPage
                          ? "min-w-8 rounded-md border border-blue-600 bg-blue-600 px-2 py-1 text-xs font-semibold text-white"
                          : "min-w-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      }
                    >
                      {p}
                    </button>
                  ));
                })()}

                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={() => setPage(currentPage + 1)}
                  aria-label="Next page"
                  className="min-w-8 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ›
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
