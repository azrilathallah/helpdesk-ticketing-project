import React, { useEffect, useMemo, useState } from "react";
import { approvalApi } from "../../api/approval";

/* =========================================================
   CONSTANTS (Sama persis dengan CustomerFormPage)
========================================================= */

const REQUEST_TYPES = [["New"], ["Change"], ["Extend"], ["Block / Unblock"]];

const ACCOUNT_GROUPS = [
  ["Z010", "Customer-Tenant"],
  ["Z020", "Customer-Non Tenant"],
  ["Z030", "Customer-Advertising Agency"],
  ["Z040", "Customer-Affiliated"],
  ["Z050", "Customer-Shareholder"],
  ["Z060", "Customer-Building Owner"],
  ["Z070", "Customer-OneTime"],
];

const COMPANY_CODES = [["1200", "IBSW"]];
const SALES_ORGANIZATION = [["1200", "IBSW"]];
const DISTRIBUTION_CHANNELS = [["00", "Common"]];
const DIVISIONS = [["00", "Common"]];

const CUSTOMER_CLASSES = [
  ["01", "Standard"],
  ["03", "Government (WAPU)"],
];

const SORT_KEYS = [
  ["002", "Document No., Fiscal Year"],
  ["022", "One Time Name/City"],
];

const TERMS_OF_PAYMENT = [
  ["AR00", "Payable immediately Due net"],
  ["AR01", "Due in 14 days"],
  ["AR02", "Due in 30 days"],
  ["AR03", "Due in 60 days"],
  ["AR04", "Due in 365 days"],
  ["AR05", "Due in 2 years"],
];

const TOLERANCE_GROUPS = [["1200", "Cust/Vend Tolerance"]];

const WITHOLDING_TAX = [
  ["P4", "PPh4(2) - Customer Payment Deduction"],
  ["P5", "PPh23 - Customer Payment Deduction"],
];

const CURRENCIES = ["IDR", "USD", "Other"];
const CUSTOMER_PRICING_PROCEDURES = [["1", "Standard"]];
const CUSTOMER_STATISTIC_GROUPS = [["1", "Standard"]];
const TAX_CLASSIFICATIONS = [
  ["0", "No Tax"],
  ["1", "Tax"],
  ["2", "WAPU"],
];

const STATUS_CONFIG = {
  SUBMITTED: {
    label: "Waiting Division Head",
    className: "approval-status--submitted",
  },
  APPROVED_DIV_HEAD: {
    label: "Division Head Approved",
    className: "approval-status--approved",
  },
  REVIEW_ACCOUNTING: {
    label: "Review Accounting",
    className: "approval-status--accounting",
  },
  APPROVED_ACCOUNTING: {
    label: "Accounting Approved",
    className: "approval-status--approved",
  },
  REVIEW_TAX: {
    label: "Review Tax",
    className: "approval-status--tax",
  },
  APPROVED_TAX: {
    label: "Tax Approved",
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

/* =========================================================
   HELPERS & PRESENTATIONAL COMPONENTS
========================================================= */

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatus(status) {
  return (
    STATUS_CONFIG[status] || {
      label: status,
      className: "",
    }
  );
}

function Section({ number, title, children }) {
  return (
    <section className="customer-form__section">
      <div className="customer-form__section-title">
        <span>{number}</span>
        <h3>{title}</h3>
      </div>
      <div className="customer-form__section-body">{children}</div>
    </section>
  );
}

function Field({ label, required = false, hint = "", children }) {
  return (
    <div className="customer-form__field">
      <label className="customer-form__label">
        {label}
        {required && <span className="customer-form__required"> *</span>}
      </label>
      {children}
      {hint && <small className="customer-form__hint">{hint}</small>}
    </div>
  );
}

function ReadOnlyField({ label, value, hint = "", lockedBy = "" }) {
  return (
    <div className="customer-form__field">
      <label className="customer-form__label">{label}</label>
      <div className="customer-form__readonly-wrapper">
        <input
          type="text"
          className="customer-form__input customer-form__input--readonly"
          value={value || "-"}
          readOnly
        />
        {lockedBy && (
          <span className="customer-form__locked-label">{lockedBy}</span>
        )}
      </div>
      {hint && <small className="customer-form__hint">{hint}</small>}
    </div>
  );
}

function ChoiceGroup({
  label,
  options,
  value,
  onChange,
  checkbox = false,
  disabled = false,
  required = false,
}) {
  const normalizedValue = value || (checkbox ? [] : "");

  return (
    <Field label={label} required={required}>
      <div
        className={`customer-form__choices ${
          checkbox ? "customer-form__choices--checkbox" : ""
        } ${disabled ? "customer-form__choices--disabled" : ""}`}
      >
        {options.map(([code, name]) => {
          const checked = checkbox
            ? Array.isArray(normalizedValue) && normalizedValue.includes(code)
            : normalizedValue === code;

          return (
            <label
              key={code}
              className={`customer-form__choice ${
                disabled ? "customer-form__choice--disabled" : ""
              }`}
            >
              <input
                type={checkbox ? "checkbox" : "radio"}
                name={checkbox ? undefined : label}
                value={code}
                checked={checked}
                disabled={disabled}
                onChange={(e) => {
                  if (disabled || !onChange) return;

                  if (!checkbox) {
                    onChange(e.target.value);
                    return;
                  }

                  const currentList = Array.isArray(normalizedValue)
                    ? normalizedValue
                    : [];
                  onChange(
                    e.target.checked
                      ? [...currentList, e.target.value]
                      : currentList.filter((item) => item !== e.target.value),
                  );
                }}
              />
              <span>
                <strong>{code}</strong>
                {name && ` - ${name}`}
              </span>
            </label>
          );
        })}
      </div>
    </Field>
  );
}

function PairedTextField({
  label,
  leftValue,
  rightValue,
  onLeftChange,
  onRightChange,
  leftPlaceholder = "",
  rightPlaceholder = "",
  rightType = "text",
  separator = "/",
  requiredLeft = false,
  requiredRight = false,
  disabled = false,
}) {
  return (
    <div className="customer-form__field">
      <label className="customer-form__label">
        {label}
        {(requiredLeft || requiredRight) && (
          <span className="customer-form__required"> *</span>
        )}
      </label>

      <div className="customer-form__two-column">
        <input
          type="text"
          className={`customer-form__input ${
            disabled ? "customer-form__input--readonly" : ""
          }`}
          value={leftValue || ""}
          onChange={(e) => onLeftChange && onLeftChange(e.target.value)}
          placeholder={leftPlaceholder}
          readOnly={disabled}
          disabled={disabled}
        />

        <span className="customer-form__separator">{separator}</span>

        <input
          type={rightType}
          className={`customer-form__input ${
            disabled ? "customer-form__input--readonly" : ""
          }`}
          value={rightValue || ""}
          onChange={(e) => onRightChange && onRightChange(e.target.value)}
          placeholder={rightPlaceholder}
          readOnly={disabled}
          disabled={disabled}
        />
      </div>
    </div>
  );
}

function LockedBox({ title, note = "", children }) {
  return (
    <div className="customer-form__locked-box">
      <div className="customer-form__locked-header">
        <strong>{title}</strong>
        {note && <span>{note}</span>}
      </div>
      {children}
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT: ApprovalPage
========================================================= */

export default function ApprovalPage() {
  const [submissions, setSubmissions] = useState([]);
  const [selected, setSelected] = useState(null);

  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  /* State reject modal & notes */
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
  const [rejectError, setRejectError] = useState("");

  /* Form edit states for Accounting */
  const [accounting, setAccounting] = useState({
    accountGroup: "",
    recontAccount: "",
    sortKey: "",
    toleranceGroup: "",
  });

  /* Form edit states for Tax */
  const [tax, setTax] = useState({
    witholdingTax: [],
  });

  /* Form edit state for PIC */
  const [customerCode, setCustomerCode] = useState("");

  const loadApprovals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await approvalApi.getAll();
      setSubmissions(response.data?.data || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Gagal mengambil daftar approval.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  const filteredSubmissions = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchesSearch =
        !keyword ||
        submission.number?.toLowerCase().includes(keyword) ||
        submission.form_type?.toLowerCase().includes(keyword) ||
        submission.category?.toLowerCase().includes(keyword) ||
        submission.sub_category?.toLowerCase().includes(keyword) ||
        submission.requestor?.name?.toLowerCase().includes(keyword);

      const matchesStatus =
        statusFilter === "ALL" || submission.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  const openDetail = async (submission) => {
    try {
      setSelected(null);
      setActionError("");
      setRejectModalOpen(false);
      setRejectNotes("");
      setRejectError("");

      setAccounting({
        accountGroup: "",
        recontAccount: "",
        sortKey: "",
        toleranceGroup: "",
      });

      setTax({
        witholdingTax: [],
      });

      setCustomerCode("");
      setDetailLoading(true);

      const response = await approvalApi.getById(submission.id);
      const data = response.data?.data;

      setSelected(data);

      const formData = data?.form_data || {};

      setAccounting({
        accountGroup: formData.accountGroup || "",
        recontAccount: formData.recontAccount || "",
        sortKey: formData.sortKey || "",
        toleranceGroup: formData.toleranceGroup || "",
      });

      setTax({
        witholdingTax: Array.isArray(formData.witholdingTax)
          ? formData.witholdingTax
          : [],
      });

      setCustomerCode(formData.customerCode || "");
    } catch (err) {
      console.error(err);
      setActionError(
        err.response?.data?.message || "Gagal mengambil detail submission.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    if (processing) return;
    setSelected(null);
    setActionError("");
    setRejectModalOpen(false);
  };

  const refreshAfterAction = async () => {
    await loadApprovals();

    if (selected?.id) {
      try {
        const response = await approvalApi.getById(selected.id);
        const fresh = response.data?.data;
        setSelected(fresh || null);

        if (fresh?.form_data) {
          setAccounting({
            accountGroup: fresh.form_data.accountGroup || "",
            recontAccount: fresh.form_data.recontAccount || "",
            sortKey: fresh.form_data.sortKey || "",
            toleranceGroup: fresh.form_data.toleranceGroup || "",
          });

          setTax({
            witholdingTax: Array.isArray(fresh.form_data.witholdingTax)
              ? fresh.form_data.witholdingTax
              : [],
          });

          setCustomerCode(fresh.form_data.customerCode || "");
        }
      } catch {
        setSelected(null);
      }
    }
  };

  const updateAccounting = (field, value) => {
    setAccounting((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateTax = (newWitholdingTax) => {
    setTax({
      witholdingTax: newWitholdingTax,
    });
  };

  /* Open Reject Dialog */
  const openRejectModal = () => {
    setRejectNotes("");
    setRejectError("");
    setRejectModalOpen(true);
  };

  /* Confirm Reject */
  const handleConfirmReject = async () => {
    if (!selected || processing) return;

    if (!rejectNotes.trim()) {
      setRejectError("Catatan / alasan penolakan wajib diisi.");
      return;
    }

    try {
      setProcessing(true);
      setRejectError("");

      const response = await approvalApi.reject(
        selected.id,
        rejectNotes.trim(),
      );

      alert(response?.data?.message || "Submission berhasil di-reject.");
      setRejectModalOpen(false);
      setRejectNotes("");
      await refreshAfterAction();
    } catch (err) {
      console.error(err);
      setRejectError(
        err.response?.data?.message || "Gagal me-reject submission.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleAction = async (action) => {
    if (!selected || processing) return;

    try {
      setProcessing(true);
      setActionError("");

      let response;

      switch (action) {
        case "approve-divhead":
          response = await approvalApi.approveDivHead(selected.id, "");
          break;

        case "fill-accounting": {
          if (
            !accounting.accountGroup ||
            !accounting.recontAccount ||
            !accounting.sortKey ||
            !accounting.toleranceGroup
          ) {
            setActionError("Semua field accounting wajib diisi sebelum disimpan.");
            setProcessing(false);
            return;
          }

          response = await approvalApi.fillAccounting(
            selected.id,
            accounting,
            "",
          );
          break;
        }

        case "approve-accounting":
          response = await approvalApi.approveAccounting(selected.id, "");
          break;

        case "fill-tax": {
          if (!tax.witholdingTax || tax.witholdingTax.length === 0) {
            setActionError("Pilih minimal satu witholding tax sebelum disimpan.");
            setProcessing(false);
            return;
          }

          response = await approvalApi.fillTax(selected.id, tax, "");
          break;
        }

        case "approve-tax":
          response = await approvalApi.approveTax(selected.id, "");
          break;

        case "resolve": {
          const isNewRequest = selected.form_data?.requestType === "New";
          if (isNewRequest && !customerCode.trim()) {
            setActionError("Customer code wajib diisi oleh PIC untuk request New.");
            setProcessing(false);
            return;
          }

          response = await approvalApi.resolve(
            selected.id,
            customerCode.trim(),
            "",
          );
          break;
        }

        default:
          return;
      }

      alert(response?.data?.message || "Action berhasil dilakukan.");
      await refreshAfterAction();
    } catch (err) {
      console.error(err);
      setActionError(err.response?.data?.message || "Action gagal dilakukan.");
    } finally {
      setProcessing(false);
    }
  };

  /* Helper untuk mengecek apakah Accounting sudah di-save/di-isi */
  const hasAccountingSaved = useMemo(() => {
    if (!selected) return false;

    const hasFilledRecord = selected.approval_history?.some(
      (h) => h.step === "ACCOUNTING_FILL" && h.action === "FILLED",
    );

    const hasFormData = Boolean(
      selected.form_data?.accountGroup &&
      selected.form_data?.recontAccount &&
      selected.form_data?.sortKey &&
      selected.form_data?.toleranceGroup,
    );

    return hasFilledRecord || hasFormData;
  }, [selected]);

  /* Helper untuk mengecek apakah Tax sudah di-save/di-isi */
  const hasTaxSaved = useMemo(() => {
    if (!selected) return false;

    const hasFilledRecord = selected.approval_history?.some(
      (h) => h.step === "TAX_FILL" && h.action === "FILLED",
    );

    const hasFormData =
      Array.isArray(selected.form_data?.witholdingTax) &&
      selected.form_data.witholdingTax.length > 0;

    return hasFilledRecord || hasFormData;
  }, [selected]);

  /* Render Tombol Aksi */
  const renderActionButtons = () => {
    if (!selected) return null;

    const status = selected.status;

    /* 1. Division Head Turn */
    if (status === "SUBMITTED") {
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

          <button
            type="button"
            className="customer-form__button customer-form__button--primary"
            style={{
              background: "#16a34a",
              borderColor: "#16a34a",
            }}
            onClick={() => handleAction("approve-divhead")}
            disabled={processing}
          >
            {processing ? "Processing..." : "Approve as Division Head"}
          </button>
        </div>
      );
    }

    /* 2. Accounting Turn */
    if (status === "REVIEW_ACCOUNTING") {
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

          {!hasAccountingSaved ? (
            /* Belum di-save: HANYA ada tombol Save Accounting Data dan Reject (Tombol Approve TIDAK MUNCUL) */
            <button
              type="button"
              className="customer-form__button customer-form__button--primary"
              onClick={() => handleAction("fill-accounting")}
              disabled={
                processing ||
                !accounting.accountGroup ||
                !accounting.recontAccount ||
                !accounting.sortKey ||
                !accounting.toleranceGroup
              }
            >
              {processing ? "Saving..." : "Save Accounting Data"}
            </button>
          ) : (
            /* Sudah di-save: Tombol HANYA Reject dan Approve */
            <button
              type="button"
              className="customer-form__button customer-form__button--primary"
              style={{
                background: "#16a34a",
                borderColor: "#16a34a",
              }}
              onClick={() => handleAction("approve-accounting")}
              disabled={processing}
            >
              {processing ? "Processing..." : "Approve as Accounting Head"}
            </button>
          )}
        </div>
      );
    }

    /* 3. Tax Turn */
    if (status === "REVIEW_TAX") {
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

          {!hasTaxSaved ? (
            /* Belum di-save: HANYA ada tombol Save Tax Data dan Reject (Tombol Approve TIDAK MUNCUL) */
            <button
              type="button"
              className="customer-form__button customer-form__button--primary"
              onClick={() => handleAction("fill-tax")}
              disabled={
                processing ||
                !tax.witholdingTax ||
                tax.witholdingTax.length === 0
              }
            >
              {processing ? "Saving..." : "Save Tax Data"}
            </button>
          ) : (
            /* Sudah di-save: Tombol HANYA Reject dan Approve */
            <button
              type="button"
              className="customer-form__button customer-form__button--primary"
              style={{
                background: "#16a34a",
                borderColor: "#16a34a",
              }}
              onClick={() => handleAction("approve-tax")}
              disabled={processing}
            >
              {processing ? "Processing..." : "Approve as Tax Head"}
            </button>
          )}
        </div>
      );
    }

    /* 4. PIC Turn */
    if (status === "WAITING_PIC") {
      const isNew = selected.form_data?.requestType === "New";

      return (
        <div className="customer-form__actions">
          {/* PIC TIDAK BISA REJECT, HANYA BISA RESOLVE */}
          <button
            type="button"
            className="customer-form__button customer-form__button--primary"
            style={{
              background: "#16a34a",
              borderColor: "#16a34a",
              width: "100%",
            }}
            onClick={() => handleAction("resolve")}
            disabled={processing || (isNew && !customerCode.trim())}
          >
            {processing ? "Processing..." : "Resolve Ticket"}
          </button>
        </div>
      );
    }

    /* Tiket yang sudah selesai / terminal */
    return (
      <div className="customer-form__actions">
        <button
          type="button"
          className="customer-form__button customer-form__button--secondary"
          onClick={closeDetail}
        >
          Back to List
        </button>
      </div>
    );
  };

  const formData = selected?.form_data || {};
  const isAccountingTurn = selected?.status === "REVIEW_ACCOUNTING";
  const isTaxTurn = selected?.status === "REVIEW_TAX";
  const isPICTurn = selected?.status === "WAITING_PIC";
  const isNewRequest = formData.requestType === "New";

  return (
    <div className="approval-page">
      {/* HEADER UTAMA */}
      <div className="approval-page__header">
        <div>
          <h1>Approval List</h1>
          <p>
            Review and process SAP Master Data requests according to the
            approval workflow.
          </p>
        </div>

        <button
          type="button"
          className="approval-refresh"
          onClick={loadApprovals}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {/* SUMMARY STATS */}
      <div className="approval-summary">
        <div className="approval-summary__card">
          <span>Total Pending</span>
          <strong>{submissions.length}</strong>
        </div>

        <div className="approval-summary__card">
          <span>Accounting</span>
          <strong>
            {
              submissions.filter((item) => item.status === "REVIEW_ACCOUNTING")
                .length
            }
          </strong>
        </div>

        <div className="approval-summary__card">
          <span>Tax</span>
          <strong>
            {submissions.filter((item) => item.status === "REVIEW_TAX").length}
          </strong>
        </div>

        <div className="approval-summary__card">
          <span>PIC</span>
          <strong>
            {submissions.filter((item) => item.status === "WAITING_PIC").length}
          </strong>
        </div>
      </div>

      {/* MAIN CARD TABLE */}
      <div className="approval-card">
        <div className="approval-card__toolbar">
          <div>
            <h2>Pending Requests</h2>
            <p>
              {filteredSubmissions.length} request
              {filteredSubmissions.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="approval-filters">
            <div className="approval-search">
              <span>⌕</span>
              <input
                type="text"
                placeholder="Search number, requestor, form..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  ×
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="SUBMITTED">Waiting Division Head</option>
              <option value="REVIEW_ACCOUNTING">Review Accounting</option>
              <option value="REVIEW_TAX">Review Tax</option>
              <option value="WAITING_PIC">Waiting PIC</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="approval-alert approval-alert--error">{error}</div>
        )}

        {loading && (
          <div className="approval-empty">
            <strong>Loading approval list...</strong>
          </div>
        )}

        {!loading && !error && filteredSubmissions.length === 0 && (
          <div className="approval-empty">
            <div className="approval-empty__icon">✓</div>
            <h3>No pending approval</h3>
            <p>Tidak ada submission yang sedang menunggu proses approval.</p>
          </div>
        )}

        {!loading && filteredSubmissions.length > 0 && (
          <div className="approval-table-wrapper">
            <table className="approval-table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Requestor</th>
                  <th>Request</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredSubmissions.map((submission) => {
                  const status = getStatus(submission.status);

                  return (
                    <tr key={submission.id}>
                      <td>
                        <strong>{submission.number}</strong>
                        <span className="approval-table__type">
                          {submission.type}
                        </span>
                      </td>

                      <td>
                        <strong>{submission.requestor?.name || "-"}</strong>
                        <span className="approval-table__muted">
                          {submission.requestor?.email || "-"}
                        </span>
                      </td>

                      <td>
                        <strong>{submission.form_type}</strong>
                        <span className="approval-table__muted">
                          {submission.sub_category || "-"}
                        </span>
                      </td>

                      <td>{submission.category || "-"}</td>

                      <td>
                        <span className={`approval-status ${status.className}`}>
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
                          className="approval-table__view"
                          onClick={() => openDetail(submission)}
                        >
                          Review →
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

      {/* =========================================================
          MODAL DETAIL DENGAN TAMPILAN FORM SAMA PERSIS
      ========================================================= */}
      {selected && (
        <div
          className="approval-modal"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            padding: "2rem 1rem",
            background: "rgba(15, 23, 42, 0.55)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !processing) {
              closeDetail();
            }
          }}
        >
          <div
            className="approval-modal__content"
            style={{
              maxWidth: "1000px",
              width: "100%",
              margin: "0 auto 2rem",
              background: "var(--color-surface)",
              borderRadius: "var(--radius)",
              boxShadow: "var(--shadow-lg)",
              overflow: "visible",
              padding: 0,
            }}
          >
            <div
              className="customer-form-card"
              style={{ border: "none", boxShadow: "none", overflow: "visible" }}
            >
              {/* HEADER SAMA PERSIS SEPERTI FORM */}
              <header className="customer-form__header">
                <button
                  type="button"
                  className="customer-form__back"
                  onClick={closeDetail}
                  disabled={processing}
                >
                  ← Back
                </button>

                <div className="customer-form__header-content">
                  <div>
                    <p className="customer-form__eyebrow">
                      {selected.type || "SAP"} ·{" "}
                      {selected.category || "Master Data"} ·{" "}
                      {selected.sub_category || "Customer"}
                    </p>
                    <h1>Master Data Customer Request</h1>
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "0.85rem",
                        color: "var(--color-text-muted)",
                      }}
                    >
                      Ticket: <strong>{selected.number}</strong>
                    </p>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                    }}
                  >
                    <span
                      className={`approval-status ${
                        getStatus(selected.status).className
                      }`}
                    >
                      {getStatus(selected.status).label}
                    </span>

                    <button
                      type="button"
                      className="approval-modal__close"
                      onClick={closeDetail}
                      disabled={processing}
                    >
                      ×
                    </button>
                  </div>
                </div>
              </header>

              {detailLoading ? (
                <div className="approval-empty">Loading detail...</div>
              ) : (
                <form
                  className="customer-form"
                  onSubmit={(e) => e.preventDefault()}
                >
                  {actionError && (
                    <div
                      className="approval-alert approval-alert--error"
                      style={{ margin: "1rem 2rem 0" }}
                    >
                      {actionError}
                    </div>
                  )}

                  {/* 1. REQUEST TYPE */}
                  <Section number="1" title="Request Type">
                    <ChoiceGroup
                      label="Request Type"
                      options={REQUEST_TYPES}
                      value={formData.requestType || "New"}
                      disabled={true}
                    />

                    {isNewRequest ? (
                      isPICTurn ? (
                        <Field
                          label="Customer Code"
                          required
                          hint="Customer code wajib diisi oleh PIC untuk request New."
                        >
                          <input
                            type="text"
                            className="customer-form__input"
                            value={customerCode}
                            onChange={(e) => setCustomerCode(e.target.value)}
                            placeholder="Input customer code (PIC)"
                            disabled={processing}
                            required
                          />
                        </Field>
                      ) : (
                        <ReadOnlyField
                          label="Customer Code"
                          value={formData.customerCode || "-"}
                        />
                      )
                    ) : (
                      <ReadOnlyField
                        label="Customer Code"
                        value={formData.customerCode || "-"}
                      />
                    )}
                  </Section>

                  {/* 2. REQUESTOR */}
                  <Section number="2" title="Requestor">
                    <ReadOnlyField
                      label="Name"
                      value={selected.requestor?.name || formData.name || "-"}
                    />
                    <ReadOnlyField
                      label="Position (Jabatan)"
                      value={
                        selected.requestor?.position ||
                        formData.position ||
                        "-"
                      }
                    />

                    <div className="customer-form__field">
                      <label className="customer-form__label">
                        Division / Department
                      </label>
                      <div className="customer-form__two-column">
                        <input
                          type="text"
                          className="customer-form__input customer-form__input--readonly"
                          value={
                            selected.requestor?.division ||
                            formData.division ||
                            "-"
                          }
                          readOnly
                        />
                        <span className="customer-form__separator">/</span>
                        <input
                          type="text"
                          className="customer-form__input customer-form__input--readonly"
                          value={
                            selected.requestor?.department ||
                            formData.department ||
                            "-"
                          }
                          readOnly
                        />
                      </div>
                    </div>

                    <ReadOnlyField
                      label="Telephone"
                      value={
                        selected.requestor?.telephone ||
                        formData.telephone ||
                        "-"
                      }
                    />
                    <ReadOnlyField
                      label="Email"
                      value={
                        selected.requestor?.email || formData.email || "-"
                      }
                    />
                  </Section>

                  {/* 3. INITIAL SCREEN */}
                  <Section number="3" title="Initial Screen">
                    {/* Account Group: Diisi oleh Accounting saat giliran Accounting */}
                    {isAccountingTurn ? (
                      <ChoiceGroup
                        label="Account Group"
                        options={ACCOUNT_GROUPS}
                        value={accounting.accountGroup}
                        onChange={(val) =>
                          updateAccounting("accountGroup", val)
                        }
                        required
                        disabled={processing}
                      />
                    ) : (
                      <Field label="Account Group">
                        <LockedBox title="Filled by Accounting">
                          <ChoiceGroup
                            options={ACCOUNT_GROUPS}
                            value={
                              accounting.accountGroup ||
                              formData.accountGroup ||
                              ""
                            }
                            disabled={true}
                          />
                        </LockedBox>
                      </Field>
                    )}

                    <ChoiceGroup
                      label="Company Code"
                      options={COMPANY_CODES}
                      value={formData.companyCode || "1200"}
                      disabled={true}
                    />

                    <ChoiceGroup
                      label="Sales Organization"
                      options={SALES_ORGANIZATION}
                      value={formData.salesOrganization || "1200"}
                      disabled={true}
                    />

                    <ChoiceGroup
                      label="Distribution Channel"
                      options={DISTRIBUTION_CHANNELS}
                      value={formData.distributionChannel || ["00"]}
                      checkbox
                      disabled={true}
                    />

                    <ChoiceGroup
                      label="Division"
                      options={DIVISIONS}
                      value={formData.division || ["00"]}
                      checkbox
                      disabled={true}
                    />

                    <ReadOnlyField
                      label="Customer Code"
                      value={customerCode || formData.customerCode || "-"}
                    />
                  </Section>

                  {/* 4. GENERAL DATA */}
                  <Section number="4" title="General Data">
                    <ReadOnlyField
                      label="Judul (Title)"
                      value={formData.title}
                    />

                    <ReadOnlyField
                      label="Nama Pelanggan (Name)"
                      value={formData.customerName}
                    />

                    <ReadOnlyField
                      label="Search Term 1"
                      value={formData.searchTerm1}
                    />

                    <ReadOnlyField
                      label="Alamat Invoice (Street / House Number)"
                      value={formData.invoiceStreet}
                    />

                    <ReadOnlyField
                      label="Alamat Pajak"
                      value={formData.taxStreet}
                    />

                    <PairedTextField
                      label="Kota / Kode Pos"
                      leftValue={formData.city}
                      rightValue={formData.postalCode}
                      leftPlaceholder="Kota"
                      rightPlaceholder="Kode Pos"
                      disabled={true}
                    />

                    <ReadOnlyField
                      label="Country"
                      value={formData.country}
                    />

                    <ReadOnlyField
                      label="Region"
                      value={formData.region}
                    />

                    <ReadOnlyField
                      label="Telephone"
                      value={formData.telephone}
                    />

                    <ReadOnlyField
                      label="Fax"
                      value={formData.fax}
                    />

                    <PairedTextField
                      label="NPWP (VAT Reg. No.) / Tanggal Terdaftar"
                      leftValue={formData.npwp}
                      rightValue={formData.npwpregisteredDate}
                      leftPlaceholder="NPWP (VAT Reg. No.)"
                      rightType="date"
                      disabled={true}
                    />

                    <ChoiceGroup
                      label="Customer Class"
                      options={CUSTOMER_CLASSES}
                      value={formData.customerClass}
                      disabled={true}
                    />
                  </Section>

                  {/* 5. COMPANY CODE DATA */}
                  <Section number="5" title="Company Code Data">
                    {/* Recon Account: Diisi oleh Accounting saat giliran Accounting */}
                    {isAccountingTurn ? (
                      <Field
                        label="Recon Account"
                        required
                        hint="Diisi oleh Accounting"
                      >
                        <input
                          type="text"
                          className="customer-form__input"
                          value={accounting.recontAccount}
                          onChange={(e) =>
                            updateAccounting("recontAccount", e.target.value)
                          }
                          placeholder="Masukkan Recon Account"
                          disabled={processing}
                          required
                        />
                      </Field>
                    ) : (
                      <ReadOnlyField
                        label="Recon Account"
                        value={
                          accounting.recontAccount ||
                          formData.recontAccount ||
                          "-"
                        }
                        lockedBy="Filled by Accounting"
                      />
                    )}

                    {/* SORT KEY: Diisi oleh Accounting saat giliran Accounting */}
                    {isAccountingTurn ? (
                      <ChoiceGroup
                        label="Sort Key"
                        options={SORT_KEYS}
                        value={accounting.sortKey}
                        onChange={(val) => updateAccounting("sortKey", val)}
                        required
                        disabled={processing}
                      />
                    ) : (
                      <Field label="Sort Key">
                        <LockedBox title="Filled by Accounting">
                          <ChoiceGroup
                            options={SORT_KEYS}
                            value={
                              accounting.sortKey || formData.sortKey || ""
                            }
                            disabled={true}
                          />
                        </LockedBox>
                      </Field>
                    )}

                    <ChoiceGroup
                      label="Terms of Payment"
                      options={TERMS_OF_PAYMENT}
                      value={formData.paymentTerms}
                      disabled={true}
                    />

                    {/* TOLERANCE GROUP: Diisi oleh Accounting saat giliran Accounting */}
                    {isAccountingTurn ? (
                      <ChoiceGroup
                        label="Tolerance Group"
                        options={TOLERANCE_GROUPS}
                        value={accounting.toleranceGroup}
                        onChange={(val) =>
                          updateAccounting("toleranceGroup", val)
                        }
                        required
                        disabled={processing}
                      />
                    ) : (
                      <Field label="Tolerance Group">
                        <LockedBox title="Filled by Accounting">
                          <ChoiceGroup
                            options={TOLERANCE_GROUPS}
                            value={
                              accounting.toleranceGroup ||
                              formData.toleranceGroup ||
                              ""
                            }
                            disabled={true}
                          />
                        </LockedBox>
                      </Field>
                    )}

                    {/* WITHOLDING TAX: Diisi oleh Tax saat giliran Tax */}
                    {isTaxTurn ? (
                      <ChoiceGroup
                        label="Witholding Tax"
                        options={WITHOLDING_TAX}
                        value={tax.witholdingTax}
                        onChange={(val) => updateTax(val)}
                        checkbox
                        required
                        disabled={processing}
                      />
                    ) : (
                      <Field label="Witholding Tax">
                        <LockedBox title="Filled by Tax">
                          <ChoiceGroup
                            options={WITHOLDING_TAX}
                            value={
                              tax.witholdingTax?.length
                                ? tax.witholdingTax
                                : formData.witholdingTax || []
                            }
                            checkbox
                            disabled={true}
                          />
                        </LockedBox>
                      </Field>
                    )}
                  </Section>

                  {/* 6. SALES AREA DATA */}
                  <Section number="6" title="Sales Area Data">
                    <Field label="Currency">
                      <div className="customer-form__choices">
                        {CURRENCIES.map((currency) => (
                          <label
                            key={currency}
                            className="customer-form__choice customer-form__choice--disabled"
                          >
                            <input
                              type="radio"
                              name="currency"
                              value={currency}
                              checked={formData.currency === currency}
                              disabled={true}
                            />
                            <span>{currency}</span>
                          </label>
                        ))}
                      </div>

                      {formData.currency === "Other" && (
                        <div className="customer-form__nested-field">
                          <label className="customer-form__nested-label">
                            Other Currency
                          </label>
                          <input
                            type="text"
                            className="customer-form__input customer-form__input--readonly"
                            value={formData.otherCurrency || "-"}
                            readOnly
                          />
                        </div>
                      )}
                    </Field>

                    <ChoiceGroup
                      label="Customer Pricing Procedure"
                      options={CUSTOMER_PRICING_PROCEDURES}
                      value={formData.customerPricingProcedure || ["1"]}
                      checkbox
                      disabled={true}
                    />

                    <ChoiceGroup
                      label="Customer Statistic Group"
                      options={CUSTOMER_STATISTIC_GROUPS}
                      value={formData.customerStatisticGroup || ["1"]}
                      checkbox
                      disabled={true}
                    />

                    <ChoiceGroup
                      label="Tax Classification"
                      options={TAX_CLASSIFICATIONS}
                      value={formData.taxClassification}
                      disabled={true}
                    />
                  </Section>

                  {/* 7. ATTACHMENT */}
                  <Section number="7" title="Attachment">
                    {selected.attachments && selected.attachments.length > 0 ? (
                      <div className="approval-attachments">
                        {selected.attachments.map((attachment, index) => (
                          <div
                            key={`${attachment.name}-${index}`}
                            className="approval-attachment"
                          >
                            <span>📎</span>
                            <div>
                              <strong>{attachment.name}</strong>
                              <small>
                                {attachment.size
                                  ? `${(attachment.size / 1024).toFixed(1)} KB`
                                  : attachment.type || "File"}
                              </small>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="customer-form__attachment-readonly">
                        <span className="customer-form__attachment-readonly-icon">
                          📎
                        </span>
                        <div>
                          <strong>Attachment</strong>
                          <p>Tidak ada attachment yang diunggah.</p>
                        </div>
                      </div>
                    )}
                  </Section>

                  {/* 8. APPROVAL HISTORY */}
                  <Section number="8" title="Approval History">
                    {selected.approval_history?.length ? (
                      <div className="approval-history">
                        {selected.approval_history.map((item) => {
                          const isRejected = item.action === "REJECTED";

                          return (
                            <div
                              key={item.id}
                              className="approval-history__item"
                            >
                              <div
                                className={`approval-history__marker ${
                                  isRejected
                                    ? "approval-history__marker--rejected"
                                    : ""
                                }`}
                              >
                                {isRejected ? "✕" : "✓"}
                              </div>

                              <div className="approval-history__content">
                                <div className="approval-history__top">
                                  <strong>{item.step}</strong>
                                  <span>{formatDate(item.created_at)}</span>
                                </div>

                                <p
                                  className={
                                    isRejected
                                      ? "approval-history__action--rejected"
                                      : ""
                                  }
                                >
                                  {item.action}
                                </p>

                                <small>
                                  By: {item.actor?.name || "-"} (
                                  {item.actor?.email || "-"})
                                </small>

                                {/* NOTES HANYA MUNCUL KETIKA SUBMISSION DI-REJECT */}
                                {isRejected && item.notes && (
                                  <div className="approval-history__notes">
                                    <strong style={{ color: "#991b1b" }}>
                                      Catatan / Alasan Penolakan:
                                    </strong>
                                    <p
                                      style={{
                                        margin: "4px 0 0",
                                        whiteSpace: "pre-wrap",
                                      }}
                                    >
                                      {item.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="approval-muted">
                        Belum ada riwayat approval.
                      </p>
                    )}
                  </Section>

                  {/* TOMBOL AKSI */}
                  {renderActionButtons()}
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL REJECT (CATATAN HANYA MUNCUL KETIKA DI-REJECT)
      ========================================================= */}
      {rejectModalOpen && (
        <div
          className="approval-modal"
          style={{ zIndex: 200, alignItems: "center" }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !processing) {
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
                Anda akan menolak ticket <strong>{selected?.number}</strong>.
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
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Tuliskan catatan alasan penolakan..."
                  autoFocus
                  disabled={processing}
                />
              </div>

              {rejectError && (
                <div
                  className="approval-alert approval-alert--error"
                  style={{ margin: "0.75rem 0 0" }}
                >
                  {rejectError}
                </div>
              )}
            </div>

            <div className="approval-reject-dialog__footer">
              <button
                type="button"
                className="customer-form__button customer-form__button--secondary"
                style={{ width: "auto", minHeight: "36px", padding: "0 1rem" }}
                onClick={() => setRejectModalOpen(false)}
                disabled={processing}
              >
                Batal
              </button>

              <button
                type="button"
                className="approval-btn approval-btn--danger"
                style={{ minHeight: "36px", padding: "0 1.25rem" }}
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