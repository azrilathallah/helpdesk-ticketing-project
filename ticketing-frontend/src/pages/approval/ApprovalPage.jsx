import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { approvalApi } from "../../api/approval";

import FormRenderer from "../../components/forms_sap/FormRenderer";

import {
  DEFAULT_CUSTOMER_FORM,
  getUserValue,
} from "../../components/forms_sap/customer/CustomerFormFields";

/* =========================================================
   STATUS
========================================================= */

const STATUS_CONFIG = {
  REVIEW_DIV_HEAD: {
    label: "Review by Division Head",
    className: "approval-status--submitted",
  },

  APPROVED_DIV_HEAD: {
    label: "Approved by Division Head",
    className: "approval-status--approved",
  },

  REVIEW_ACCOUNTING: {
    label: "Review by Accounting",
    className: "approval-status--accounting",
  },

  APPROVED_ACCOUNTING: {
    label: "Approved by Accounting",
    className: "approval-status--approved",
  },

  REVIEW_TAX: {
    label: "Review by Tax",
    className: "approval-status--tax",
  },

  APPROVED_TAX: {
    label: "Approved by Tax",
    className: "approval-status--approved",
  },

  WAITING_PIC: {
    label: "Waiting PIC",
    className: "approval-status--pic",
  },

  TICKET_SOLVED: {
    label: "Ticket Solved",
    className: "approval-status--solved",
  },

  TICKET_CANCELLED: {
    label: "Ticket Cancelled",
    className: "approval-status--cancelled",
  },

  TICKET_REJECTED: {
    label: "Ticket Rejected",
    className: "approval-status--rejected",
  },
};

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

function getStatusConfig(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status || "-",
      className: "",
    }
  );
}

/* =========================================================
   MAIN
========================================================= */

export default function ApprovalPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (id) {
    return <ApprovalDetailPage id={id} />;
  }

  return <ApprovalList navigate={navigate} />;
}

/* =========================================================
   APPROVAL LIST
========================================================= */

function ApprovalList({ navigate }) {
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

  /* =========================================================
     OPEN DETAIL
  ========================================================= */

  const handleOpen = (submission) => {
    if (!submission?.id) {
      return;
    }

    navigate(`/approval/${submission.id}`);
  };

  const getStatus = (status) => {
    return getStatusConfig(status);
  };

  return (
    <div className="my-submission">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="my-submission__header">
        <div>
          <h1 className="my-submission__title">Approval List</h1>

          <p className="my-submission__description">
            View and process requests that require your approval.
          </p>
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

      <div className="my-submission__summary">
        <div className="my-submission__summary-card">
          <div className="my-submission__summary-icon my-submission__summary-icon--submitted">
            ✎
          </div>

          <div>
            <span>Pending Approval</span>
            <strong>{submissions.length}</strong>
          </div>
        </div>
      </div>

      {/* =====================================================
          LIST
      ===================================================== */}

      <div className="my-submission__card">
        <div className="my-submission__toolbar">
          <div>
            <h2>Approval List</h2>

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
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="ALL">All Status</option>

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
            </select>
          </div>
        </div>

        {error && (
          <div className="my-submission__error">
            <span>!</span>

            <div>
              <strong>Failed to load approvals</strong>

              <p>{error}</p>
            </div>

            <button type="button" onClick={loadApprovals}>
              Retry
            </button>
          </div>
        )}

        {loading && !error && (
          <div className="my-submission__empty">
            <div className="my-submission__empty-icon">⏳</div>

            <h3>Loading approvals...</h3>

            <p>Please wait while approval data is being loaded.</p>
          </div>
        )}

        {!loading && !error && filteredSubmissions.length === 0 && (
          <div className="my-submission__empty">
            <div className="my-submission__empty-icon">📄</div>

            <h3>
              {submissions.length === 0
                ? "No approvals"
                : "No matching approvals"}
            </h3>

            <p>
              {submissions.length === 0
                ? "There are no requests waiting for your approval."
                : "Try changing your search or filter."}
            </p>
          </div>
        )}

        {/* TABLE */}

        {!loading && !error && filteredSubmissions.length > 0 && (
          <div className="approval-table-wrapper">
            <table className="approval-table">
              <thead>
                <tr>
                  <th>Number</th>

                  <th>Request</th>

                  <th>Requestor</th>

                  <th>Status</th>

                  <th>Created</th>

                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredSubmissions.map((submission) => {
                  const status = getStatus(submission.status);

                  return (
                    <tr
                      key={submission.id}
                      onClick={() => handleOpen(submission)}
                    >
                      <td>
                        <strong>{submission.number}</strong>
                      </td>

                      <td>{submission.form_type}</td>

                      <td>{submission.requestor?.name}</td>

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
                        <button
                          type="button"
                          className="my-submission__action"
                          onClick={(event) => {
                            event.stopPropagation();

                            handleOpen(submission);
                          }}
                        >
                          Review
                          <span>→</span>
                        </button>
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

/* =========================================================
   APPROVAL DETAIL
========================================================= */

function ApprovalDetailPage({ id }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [submission, setSubmission] = useState(null);

  const [formData, setFormData] = useState(DEFAULT_CUSTOMER_FORM);

  const [processing, setProcessing] = useState(false);

  const [actionError, setActionError] = useState("");

  /* =========================================================
     ACCOUNTING
  ========================================================= */

  const [accounting, setAccounting] = useState({
    accountGroup: "",
    recontAccount: "",
    sortKey: "",
    toleranceGroup: "",
  });

  /* =========================================================
     TAX
  ========================================================= */

  const [tax, setTax] = useState({
    witholdingTax: [],
  });

  /* =========================================================
     PIC
  ========================================================= */

  const [customerCode, setCustomerCode] = useState("");

  /* =========================================================
     REJECT
  ========================================================= */

  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  const [rejectNotes, setRejectNotes] = useState("");

  const [rejectError, setRejectError] = useState("");

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
        ...DEFAULT_CUSTOMER_FORM,
        ...(data.form_data || {}),
      });

      const dataForm = data.form_data || {};

      setAccounting({
        accountGroup: dataForm.accountGroup || "",

        recontAccount: dataForm.recontAccount || "",

        sortKey: dataForm.sortKey || "",

        toleranceGroup: dataForm.toleranceGroup || "",
      });

      setTax({
        witholdingTax: Array.isArray(dataForm.witholdingTax)
          ? dataForm.witholdingTax
          : [],
      });

      setCustomerCode(dataForm.customerCode || "");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Gagal mengambil detail approval.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
  }, [id]);

  /* =========================================================
     REQUESTOR
  ========================================================= */

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

  const status = useMemo(() => {
    return getStatusConfig(submission?.status);
  }, [submission]);

  const approvalRole = useMemo(() => {
    switch (submission?.status) {
      case "REVIEW_DIV_HEAD":
        return "division_head";

      case "APPROVED_DIV_HEAD":
        return "accounting";

      case "REVIEW_ACCOUNTING":
        return null;

      case "APPROVED_ACCOUNTING":
        return "tax";

      case "REVIEW_TAX":
        return null;

      case "APPROVED_TAX":
      case "WAITING_PIC":
        return "pic";

      default:
        return null;
    }
  }, [submission]);

  /* =========================================================
     ACCOUNTING SAVED
  ========================================================= */

  const hasAccountingSaved = useMemo(() => {
    if (!submission) {
      return false;
    }

    const hasHistory = submission.approval_history?.some(
      (item) => item.step === "ACCOUNTING_FILL" && item.action === "FILLED",
    );

    const data = submission.form_data || {};

    const hasFormData = Boolean(
      data.accountGroup &&
      data.recontAccount &&
      data.sortKey &&
      data.toleranceGroup,
    );

    return hasHistory || hasFormData;
  }, [submission]);

  /* =========================================================
     TAX SAVED
  ========================================================= */

  const hasTaxSaved = useMemo(() => {
    if (!submission) {
      return false;
    }

    const hasHistory = submission.approval_history?.some(
      (item) => item.step === "TAX_FILL" && item.action === "FILLED",
    );

    const data = submission.form_data || {};

    const hasFormData =
      Array.isArray(data.witholdingTax) && data.witholdingTax.length > 0;

    return hasHistory || hasFormData;
  }, [submission]);

  /* =========================================================
     REJECT
  ========================================================= */

  const openRejectModal = () => {
    setRejectNotes("");
    setRejectError("");
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!submission || processing) {
      return;
    }

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

      alert(response?.data?.message || "Submission berhasil di-reject.");

      setRejectModalOpen(false);
      setRejectNotes("");

      await loadDetail();
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
     ACTION
  ========================================================= */

  const handleAction = async (action) => {
    if (!submission || processing) {
      return;
    }

    try {
      setProcessing(true);
      setActionError("");

      let response;

      switch (action) {
        /* =============================================
           DIVISION HEAD
        ============================================= */

        case "approve-divhead":
          response = await approvalApi.approveDivHead(submission.id, "");
          break;

        /* =============================================
           ACCOUNTING SAVE
        ============================================= */

        case "fill-accounting":
          const accountingData = {
            accountGroup: formData.accountGroup || "",
            recontAccount: formData.recontAccount || "",
            sortKey: formData.sortKey || "",
            toleranceGroup: formData.toleranceGroup || "",
          };

          if (
            !accountingData.accountGroup ||
            !accountingData.recontAccount ||
            !accountingData.sortKey ||
            !accountingData.toleranceGroup
          ) {
            setActionError(
              "Semua field accounting wajib diisi sebelum disimpan.",
            );

            setProcessing(false);

            return;
          }

          response = await approvalApi.fillAccounting(
            submission.id,
            accountingData,
            "",
          );
          break;

        /* =============================================
           ACCOUNTING APPROVE
        ============================================= */

        case "approve-accounting":
          if (!hasAccountingSaved) {
            setActionError("Data accounting harus disimpan terlebih dahulu.");

            setProcessing(false);

            return;
          }

          response = await approvalApi.approveAccounting(submission.id, "");
          break;

        /* =============================================
           TAX SAVE
        ============================================= */

        case "fill-tax":
          const taxData = {
            witholdingTax: formData.witholdingTax || "",
          };
          if (!taxData.witholdingTax || taxData.witholdingTax.length === 0) {
            setActionError(
              "Pilih minimal satu withholding tax sebelum disimpan.",
            );

            setProcessing(false);

            return;
          }

          response = await approvalApi.fillTax(submission.id, taxData, "");
          break;

        /* =============================================
           TAX APPROVE
        ============================================= */

        case "approve-tax":
          if (!hasTaxSaved) {
            setActionError("Data tax harus disimpan terlebih dahulu.");

            setProcessing(false);

            return;
          }

          response = await approvalApi.approveTax(submission.id, "");
          break;

        /* =============================================
           PIC RESOLVE
        ============================================= */

        case "resolve": {
          const picData = {
            customerCode: formData.customerCode || "",
          };
          const isNewRequest = submission.form_data?.requestType === "New";

          if (isNewRequest && !picData.customerCode.trim()) {
            setActionError(
              "Customer code wajib diisi.",
            );

            setProcessing(false);

            return;
          }

          response = await approvalApi.resolve(
            submission.id,
            picData.customerCode.trim(),
            "",
          );

          break;
        }

        default:
          setProcessing(false);
          return;
      }

      alert(response?.data?.message || "Action berhasil dilakukan.");

      await loadDetail();
    } catch (err) {
      console.error(err);

      setActionError(err.response?.data?.message || "Action gagal dilakukan.");
    } finally {
      setProcessing(false);
    }
  };

  /* =========================================================
     ACTION BUTTONS
  ========================================================= */

  const renderActionButtons = () => {
    if (!submission) {
      return null;
    }

    const currentStatus = submission.status;

    /* =============================================
       DIVISION HEAD
    ============================================= */

    if (currentStatus === "REVIEW_DIV_HEAD") {
      return (
        <div className="customer-form__actions">
          <button
            type="button"
            className="customer-form__button"
            
            onClick={openRejectModal}
            disabled={processing}
          >
            Reject
          </button>

          <button
            type="button"
            className="customer-form__button customer-form__button--primary"
            onClick={() => handleAction("approve-divhead")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve as Division Head"}
          </button>
        </div>
      );
    }

    /* =============================================
       ACCOUNTING
    ============================================= */

    if (
      currentStatus === "APPROVED_DIV_HEAD" ||
      currentStatus === "REVIEW_ACCOUNTING"
    ) {
      return (
        <div className="customer-form__actions">
          <button
            type="button"
            className="customer-form__button"
            style={{
              background: "#dc2626",
              color: "#fff",
              border: "1.5px solid #dc2626",
            }}
            onClick={openRejectModal}
            disabled={processing}
          >
            Reject
          </button>

          {currentStatus === "APPROVED_DIV_HEAD" && (
            <button
              type="submit"
              className="customer-form__button customer-form__button--primary"
              onClick={() => handleAction("fill-accounting")}
              disabled={processing}
            >
              {processing ? "Saving..." : "Save Accounting Data"}
            </button>
          )}

          {currentStatus === "REVIEW_ACCOUNTING" && (
            <button
              type="button"
              className="customer-form__button customer-form__button--primary"
              onClick={() => handleAction("approve-accounting")}
              disabled={processing || !hasAccountingSaved}
            >
              {processing ? "Processing..." : "Approve as Accounting"}
            </button>
          )}
        </div>
      );
    }

    /* =============================================
       TAX
    ============================================= */

    if (
      currentStatus === "APPROVED_ACCOUNTING" ||
      currentStatus === "REVIEW_TAX"
    ) {
      return (
        <div className="customer-form__actions">
          <button
            type="button"
            className="customer-form__button"
            style={{
              background: "#dc2626",
              color: "#fff",
              border: "1.5px solid #dc2626",
            }}
            onClick={openRejectModal}
            disabled={processing}
          >
            Reject
          </button>

          {currentStatus === "APPROVED_ACCOUNTING" && (
            <button
              type="submit"
              className="customer-form__button customer-form__button--primary"
              onClick={() => handleAction("fill-tax")}
              disabled={processing}
            >
              {processing ? "Saving..." : "Save Tax Data"}
            </button>
          )}

          {currentStatus === "REVIEW_TAX" && (
            <button
              type="button"
              className="customer-form__button customer-form__button--primary"
              onClick={() => handleAction("approve-tax")}
              disabled={processing || !hasTaxSaved}
            >
              {processing ? "Processing..." : "Approve as Tax"}
            </button>
          )}
        </div>
      );
    }

    /* =============================================
       PIC
    ============================================= */

    if (currentStatus === "APPROVED_TAX" || currentStatus === "WAITING_PIC") {
      return (
        <div className="customer-form__actions">
          <button
            type="submit"
            className="customer-form__button customer-form__button--primary"
            onClick={() => handleAction("resolve")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Resolve Ticket"}
          </button>
        </div>
      );
    }

    return null;
  };

  /* =========================================================
     LOADING
  ========================================================= */

  if (loading) {
    return (
      <div className="customer-form-page">
        <div className="customer-form-card">
          <div className="approval-empty">Loading approval...</div>
        </div>
      </div>
    );
  }

  /* =========================================================
     ERROR
  ========================================================= */

  if (error) {
    return (
      <div className="customer-form-page">
        <div className="customer-form-card">
          <div className="approval-alert approval-alert--error">{error}</div>

          <div className="customer-form__actions">
            <button
              type="button"
              className="customer-form__button customer-form__button--secondary"
              onClick={() => navigate("/approval")}
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

  /* =========================================================
     DETAIL PAGE
  ========================================================= */

  return (
    <div className="customer-form-page">
      <div className="customer-form-card">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <header className="customer-form__header">
          <button
            type="button"
            className="customer-form__back"
            onClick={() => navigate("/approval")}
            disabled={processing}
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

            <span className={`approval-status ${status.className}`}>
              {status.label}
            </span>
          </div>
        </header>

        {/* =====================================================
            ACTION ERROR
        ===================================================== */}

        {actionError && (
          <div
            className="approval-alert approval-alert--error"
            style={{
              margin: "1rem 1.5rem 0",
            }}
          >
            {actionError}
          </div>
        )}

        <form
          className="customer-form"
          onSubmit={(event) => event.preventDefault()}
        >
          {/* ===================================================
              FORM CUSTOMER
          =================================================== */}

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

          {/* ===================================================
              APPROVAL HISTORY
          =================================================== */}

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

          {renderActionButtons()}
        </form>
      </div>

      {rejectModalOpen && (
        <div
          className="approval-modal"
          style={{
            zIndex: 200,
            alignItems: "center",
          }}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !processing) {
              setRejectModalOpen(false);
            }
          }}
        >
          <div className="approval-reject-dialog">
            <div className="approval-reject-dialog__header">
              <h3>Reject Submission</h3>

              <button
                type="button"
                className="approval-modal__close"
                onClick={() => setRejectModalOpen(false)}
                disabled={processing}
              >
                ×
              </button>
            </div>

            <div className="approval-reject-dialog__body">
              <p className="approval-reject-dialog__desc">
                Anda akan menolak ticket <strong>{submission.number}</strong>.
                Silakan masukkan alasan penolakan pada kolom catatan di bawah
                ini.
              </p>

              <div className="customer-form__field">
                <label className="customer-form__label">
                  Catatan / Alasan Penolakan{" "}
                  <span className="customer-form__required">*</span>
                </label>

                <textarea
                  className="customer-form__input"
                  rows={4}
                  value={rejectNotes}
                  onChange={(event) => setRejectNotes(event.target.value)}
                  placeholder="Tuliskan catatan alasan penolakan..."
                  autoFocus
                  disabled={processing}
                />
              </div>

              {rejectError && (
                <div
                  className="approval-alert approval-alert--error"
                  style={{
                    margin: "0.75rem 0 0",
                  }}
                >
                  {rejectError}
                </div>
              )}
            </div>

            <div className="approval-reject-dialog__footer">
              <button
                type="button"
                className="customer-form__button customer-form__button--secondary"
                style={{
                  width: "auto",
                  minHeight: "36px",
                  padding: "0 1rem",
                }}
                onClick={() => setRejectModalOpen(false)}
                disabled={processing}
              >
                Batal
              </button>

              <button
                type="button"
                className="approval-btn approval-btn--danger"
                style={{
                  minHeight: "36px",
                  padding: "0 1.25rem",
                }}
                onClick={handleConfirmReject}
                disabled={processing || !rejectNotes.trim()}
              >
                {processing ? "Memproses..." : "Konfirmasi Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
