import React, { useEffect, useMemo, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import { submissionApi } from "../../api/submission";

import FormRenderer from "../../components/forms_sap/FormRenderer";

import {
  DEFAULT_CUSTOMER_FORM,
  getUserValue,
} from "../../components/forms_sap/customer/CustomerFormFields";

const getStatusConfig = (status) => {
  switch (status) {
    case "DRAFT":
      return {
        label: "Draft",
        className: "my-submission__status--draft",
      };

    case "REVIEW_DIV_HEAD":
      return {
        label: "Review by Division Head",
        className: "my-submission__status--submitted",
      };

    case "APPROVED_DIV_HEAD":
      return {
        label: "Approved by Division Head",
        className: "my-submission__status--approved",
      };

    case "REVIEW_ACCOUNTING":
      return {
        label: "Review by Accounting",
        className: "my-submission__status--accounting",
      };

    case "APPROVED_ACCOUNTING":
      return {
        label: "Approved by Accounting",
        className: "my-submission__status--approved",
      };

    case "REVIEW_TAX":
      return {
        label: "Review by Tax",
        className: "my-submission__status--tax",
      };

    case "APPROVED_TAX":
      return {
        label: "Approved by Tax",
        className: "my-submission__status--approved",
      };

    case "WAITING_PIC":
      return {
        label: "Waiting PIC",
        className: "my-submission__status--pic",
      };

    case "TICKET_SOLVED":
      return {
        label: "Ticket Solved",
        className: "my-submission__status--solved",
      };

    case "TICKET_CANCELLED":
      return {
        label: "Ticket Cancelled",
        className: "my-submission__status--cancelled",
      };

    case "TICKET_REJECTED":
      return {
        label: "Ticket Rejected",
        className: "my-submission__status--rejected",
      };

    default:
      return {
        label: status || "-",
        className: "",
      };
  }
};

export default function SubmissionPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  if (id) {
    return <SubmissionDetailPage id={id} />;
  }

  return <SubmissionList navigate={navigate} />;
}

/* =========================================================
   SUBMISSION LIST
========================================================= */

function SubmissionList({ navigate }) {
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
    if (submission.status === "DRAFT") {
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
    }

    navigate(`/submission/${submission.id}`);
  };

  const canCancel = (status) =>
    !["DRAFT", "TICKET_SOLVED", "TICKET_CANCELLED", "TICKET_REJECTED"].includes(
      status,
    );

  const handleCancelSubmission = async (submission, event) => {
    event?.stopPropagation();

    if (
      !window.confirm(
        `Apakah Anda yakin ingin membatalkan ticket ${submission.number}?`,
      )
    ) {
      return;
    }

    try {
      const response = await submissionApi.cancel(
        submission.id,
        "Dibatalkan oleh requestor",
      );

      alert(response?.data?.message || "Ticket berhasil dibatalkan.");

      await loadSubmissions();
    } catch (err) {
      console.error(err);

      alert(err.response?.data?.message || "Gagal membatalkan tiket.");
    }
  };

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="my-submission">
      {/* HEADER */}

      <div className="my-submission__header">
        <div>
          <h1 className="my-submission__title">My Submission</h1>

          <p className="my-submission__description">
            View and manage all requests that you have created.
          </p>
        </div>
      </div>

      {/* SUMMARY */}

      <div className="my-submission__summary">
        <div className="my-submission__summary-card">
          <div className="my-submission__summary-icon my-submission__summary-icon--draft">
            ✎
          </div>

          <div>
            <span>Draft</span>
            <strong>{totalDraft}</strong>
          </div>
        </div>

        <div className="my-submission__summary-card">
          <div className="my-submission__summary-icon my-submission__summary-icon--submitted">
            ✓
          </div>

          <div>
            <span>Submitted</span>
            <strong>{totalSubmitted}</strong>
          </div>
        </div>
      </div>

      {/* LIST */}

      <div className="my-submission__card">
        <div className="my-submission__toolbar">
          <div>
            <h2>Submission List</h2>

            <p>
              {filteredSubmissions.length} request
              {filteredSubmissions.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="my-submission__filters">
            <div className="my-submission__search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search number or form..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  ×
                </button>
              )}
            </div>

            <select
              className="my-submission__select"
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              <option value="ALL">All Type</option>

              <option value="SAP">SAP</option>

              <option value="IT">IT</option>
            </select>

            <select
              className="my-submission__select"
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

              <option value="WAITING_PIC">Waiting PIC</option>

              <option value="TICKET_SOLVED">Solved</option>

              <option value="TICKET_CANCELLED">Cancelled</option>

              <option value="TICKET_REJECTED">Rejected</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="my-submission__error">
            <span>!</span>

            <div>
              <strong>Failed to load submissions</strong>

              <p>{error}</p>
            </div>

            <button type="button" onClick={loadSubmissions}>
              Retry
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="my-submission__empty">
            <div className="my-submission__empty-icon">⏳</div>

            <h3>Loading submissions...</h3>

            <p>Please wait while submission data is being loaded.</p>
          </div>
        )}

        {!loading && !error && filteredSubmissions.length === 0 && (
          <div className="my-submission__empty">
            <div className="my-submission__empty-icon">📄</div>

            <h3>
              {submissions.length === 0
                ? "No submissions yet"
                : "No matching submissions"}
            </h3>

            <p>
              {submissions.length === 0
                ? "Your saved drafts and submitted requests will appear here."
                : "Try changing your search or filter."}
            </p>
          </div>
        )}

        {!error && filteredSubmissions.length > 0 && (
          <div className="approval-table-wrapper">
            <table className="approval-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Request</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredSubmissions.map((submission) => {
                  const status = getStatusConfig(submission.status);

                  return (
                    <tr
                      key={submission.id}
                      onClick={() => handleOpen(submission)}
                    >
                      <td>
                        <strong>{submission.number}</strong>
                      </td>

                      <td>{submission.form_type}</td>

                      <td>
                        <span
                          className={`my-submission__status ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      <td>
                        {formatDate(
                          submission.submitted_at || submission.created_at,
                        )}
                      </td>

                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <button
                            type="button"
                            className="my-submission__action"
                            onClick={(event) => {
                              event.stopPropagation();

                              handleOpen(submission);
                            }}
                          >
                            {submission.status === "DRAFT" ? "Edit" : "View"}

                            <span>→</span>
                          </button>

                          {canCancel(submission.status) && (
                            <button
                              type="button"
                              className="my-submission__action my-submission__action--cancel"
                              onClick={(event) =>
                                handleCancelSubmission(submission, event)
                              }
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function formatDate(date) {
  if (!date) {
    return "-";
  }

  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/* =========================================================
   SUBMISSION DETAIL
========================================================= */

function SubmissionDetailPage({ id }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [submission, setSubmission] = useState(null);

  const [formData, setFormData] = useState(DEFAULT_CUSTOMER_FORM);

  useEffect(() => {
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
          ...DEFAULT_CUSTOMER_FORM,
          ...(data.form_data || {}),
        });
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message || "Gagal mengambil detail submission.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadDetail();
  }, [id]);

  const requestor = useMemo(() => {
    return {
      name: getUserValue(submission?.requestor, ["name"]),

      position: getUserValue(submission?.requestor, ["position"]),

      division: getUserValue(submission?.requestor, ["division"]),

      department: getUserValue(submission?.requestor, ["department"]),

      telephone: getUserValue(submission?.requestor, ["telephone"]),

      email: getUserValue(submission?.requestor, ["email"]),
    };
  }, [submission]);

  if (loading) {
    return (
      <div className="customer-form-page">
        <div className="customer-form-card">
          <div className="approval-empty">Loading submission...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-form-page">
        <div className="customer-form-card">
          <div className="approval-alert approval-alert--error">{error}</div>

          <div className="customer-form__actions">
            <button
              type="button"
              className="customer-form__button customer-form__button--secondary"
              onClick={() => navigate("/submission")}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!submission) {
    return null;
  }

  const status = getStatusConfig(submission.status);

  return (
    <div className="customer-form-page">
      <div className="customer-form-card">
        {/* HEADER */}

        <header className="customer-form__header">
          <button
            type="button"
            className="customer-form__back"
            onClick={() => navigate("/submission")}
          >
            ← Back
          </button>

          <div className="customer-form__header-content">
            <div>
              <p className="customer-form__eyebrow">
                {submission.type} · {submission.category} ·{" "}
                {submission.sub_category}
              </p>

              <h1>Master Data Customer Request</h1>

              <p
                style={{
                  margin: "4px 0 0",
                  fontSize: "0.85rem",
                  color: "var(--color-text-muted)",
                }}
              >
                Ticket Number: <strong>{submission.number}</strong>
              </p>
            </div>

            <span className={`my-submission__status ${status.className}`}>
              {status.label}
            </span>
          </div>
        </header>

        <form
          className="customer-form"
          onSubmit={(event) => event.preventDefault()}
        >
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

          {/* =====================================================
              APPROVAL HISTORY
          ===================================================== */}

          <section className="customer-form__section">
            <div className="customer-form__section-title">
              <span>8</span>
              <h3>Approval History</h3>
            </div>

            <div className="customer-form__section-body">
              {(() => {
                const visibleHistory = (
                  submission.approval_history || []
                ).filter(
                  (item) =>
                    item.step === "DIV_HEAD_APPROVE" ||
                    item.step === "ACCOUNTING_APPROVE" ||
                    item.step === "TAX_APPROVE" ||
                    item.action === "SOLVED" ||
                    item.action === "REJECTED" ||
                    item.action === "CANCELLED",
                );

                if (!visibleHistory.length) {
                  return (
                    <p className="approval-muted">
                      Belum ada riwayat approval.
                    </p>
                  );
                }

                return (
                  <div className="approval-history">
                    {visibleHistory.map((item) => {
                      const isRejected = item.action === "REJECTED";
                      const isCancelled = item.action === "CANCELLED";
                      const isResolved = item.action === "SOLVED";

                      let label = item.step;

                      if (item.step === "DIV_HEAD_APPROVE") {
                        label = "Approved by Division Head";
                      } else if (item.step === "ACCOUNTING_APPROVE") {
                        label = "Approved by Accounting";
                      } else if (item.step === "TAX_APPROVE") {
                        label = "Approved by Tax";
                      } else if (isResolved) {
                        label = "Ticket Solved";
                      } else if (isRejected) {
                        label = "Ticket Rejected";
                      } else if (isCancelled) {
                        label = "Ticket Cancelled";
                      }

                      const isNegative = isRejected || isCancelled;

                      return (
                        <div key={item.id} className="approval-history__item">
                          <div
                            className={`approval-history__marker ${
                              isNegative
                                ? "approval-history__marker--rejected"
                                : ""
                            }`}
                          >
                            {isNegative ? "!" : "✓"}
                          </div>

                          <div className="approval-history__content">
                            <div className="approval-history__top">
                              <strong
                                className={
                                  isNegative
                                    ? "approval-history__action--rejected"
                                    : ""
                                }
                              >
                                {label}
                              </strong>

                              <span>{formatDate(item.created_at)}</span>
                            </div>

                            <small>By: {item.actor?.name || "-"}</small>

                            {item.notes && (
                              <div className="approval-history__notes">
                                {item.notes}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </section>
        </form>
      </div>
    </div>
  );
}
