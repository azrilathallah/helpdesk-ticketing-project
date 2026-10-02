import React, { useEffect, useMemo, useState } from "react";
import { approvalApi } from "../../api/approval";

const ACCOUNT_GROUPS = [
  ["Z010", "Customer-Tenant"],
  ["Z020", "Customer-Non Tenant"],
  ["Z030", "Customer-Advertising Agency"],
  ["Z040", "Customer-Affiliated"],
  ["Z050", "Customer-Shareholder"],
  ["Z060", "Customer-Building Owner"],
  ["Z070", "Customer-OneTime"],
];

const SORT_KEYS = [
  ["002", "Document No., Fiscal Year"],
  ["022", "One Time Name/City"],
];

const TOLERANCE_GROUPS = [
  ["1200", "Cust/Vend Tolerance"],
];

const WITHOLDING_TAX = [
  ["P4", "PPh4(2) - Customer Payment Deduction"],
  ["P5", "PPh23 - Customer Payment Deduction"],
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
};

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

function DetailField({ label, value }) {
  return (
    <div className="approval-detail__field">
      <span>{label}</span>
      <strong>{value || "-"}</strong>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="approval-detail__section">
      <h3>{title}</h3>
      {children}
    </section>
  );
}

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

  const [notes, setNotes] = useState("");

  const [accounting, setAccounting] = useState({
    accountGroup: "",
    recontAccount: "",
    sortKey: "",
    toleranceGroup: "",
  });

  const [tax, setTax] = useState({
    witholdingTax: [],
  });

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
        err.response?.data?.message ||
          "Gagal mengambil daftar approval.",
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
        statusFilter === "ALL" ||
        submission.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [submissions, search, statusFilter]);

  const openDetail = async (submission) => {
    try {
      setSelected(null);
      setActionError("");
      setNotes("");

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

      /*
       * Ambil data Accounting yang sebelumnya sudah pernah diisi.
       */
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
        err.response?.data?.message ||
          "Gagal mengambil detail submission.",
      );
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    if (processing) return;

    setSelected(null);
    setActionError("");
  };

  const refreshAfterAction = async () => {
    await loadApprovals();

    if (selected?.id) {
      try {
        const response = await approvalApi.getById(selected.id);

        setSelected(response.data?.data || null);
      } catch {
        setSelected(null);
      }
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
          response = await approvalApi.approveDivHead(
            selected.id,
            notes,
          );
          break;

        case "fill-accounting":
          response = await approvalApi.fillAccounting(
            selected.id,
            accounting,
            notes,
          );
          break;

        case "approve-accounting":
          response = await approvalApi.approveAccounting(
            selected.id,
            notes,
          );
          break;

        case "fill-tax":
          response = await approvalApi.fillTax(
            selected.id,
            tax,
            notes,
          );
          break;

        case "approve-tax":
          response = await approvalApi.approveTax(
            selected.id,
            notes,
          );
          break;

        case "resolve":
          response = await approvalApi.resolve(
            selected.id,
            customerCode,
            notes,
          );
          break;

        case "cancel":
          if (
            !window.confirm(
              "Apakah Anda yakin ingin membatalkan ticket ini?",
            )
          ) {
            setProcessing(false);
            return;
          }

          response = await approvalApi.cancel(
            selected.id,
            notes,
          );
          break;

        default:
          return;
      }

      alert(
        response?.data?.message ||
          "Action berhasil dilakukan.",
      );

      setNotes("");

      await refreshAfterAction();
    } catch (err) {
      console.error(err);

      setActionError(
        err.response?.data?.message ||
          "Action gagal dilakukan.",
      );
    } finally {
      setProcessing(false);
    }
  };

  const updateAccounting = (field, value) => {
    setAccounting((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const toggleTax = (code) => {
    setTax((prev) => ({
      ...prev,
      witholdingTax: prev.witholdingTax.includes(code)
        ? prev.witholdingTax.filter((item) => item !== code)
        : [...prev.witholdingTax, code],
    }));
  };

  const renderActionPanel = () => {
    if (!selected) return null;

    const status = selected.status;

    return (
      <div className="approval-detail__actions">
        <div className="approval-detail__notes">
          <label>Notes</label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Tambahkan catatan jika diperlukan..."
            rows={3}
            disabled={processing}
          />
        </div>

        {status === "SUBMITTED" && (
          <div className="approval-detail__action-group">
            <button
              type="button"
              className="approval-btn approval-btn--primary"
              onClick={() =>
                handleAction("approve-divhead")
              }
              disabled={processing}
            >
              {processing
                ? "Processing..."
                : "Approve as Division Head"}
            </button>

            <button
              type="button"
              className="approval-btn approval-btn--danger"
              onClick={() => handleAction("cancel")}
              disabled={processing}
            >
              Cancel Ticket
            </button>
          </div>
        )}

        {status === "REVIEW_ACCOUNTING" && (
          <>
            <div className="approval-detail__action-group">
              <button
                type="button"
                className="approval-btn approval-btn--primary"
                onClick={() =>
                  handleAction("fill-accounting")
                }
                disabled={processing}
              >
                Save Accounting Data
              </button>

              <button
                type="button"
                className="approval-btn approval-btn--success"
                onClick={() =>
                  handleAction("approve-accounting")
                }
                disabled={processing}
              >
                Approve as Accounting Head
              </button>
            </div>
          </>
        )}

        {status === "REVIEW_TAX" && (
          <div className="approval-detail__action-group">
            <button
              type="button"
              className="approval-btn approval-btn--primary"
              onClick={() => handleAction("fill-tax")}
              disabled={processing}
            >
              Save Tax Data
            </button>

            <button
              type="button"
              className="approval-btn approval-btn--success"
              onClick={() => handleAction("approve-tax")}
              disabled={processing}
            >
              Approve as Tax Head
            </button>
          </div>
        )}

        {status === "WAITING_PIC" && (
          <div className="approval-detail__action-group">
            <button
              type="button"
              className="approval-btn approval-btn--success"
              onClick={() => handleAction("resolve")}
              disabled={processing}
            >
              {processing
                ? "Processing..."
                : "Resolve Ticket"}
            </button>
          </div>
        )}

        {status !== "TICKET_SOLVED" &&
          status !== "TICKET_CANCELLED" && (
            <button
              type="button"
              className="approval-btn approval-btn--danger approval-btn--full"
              onClick={() => handleAction("cancel")}
              disabled={processing}
            >
              Cancel Ticket
            </button>
          )}
      </div>
    );
  };

  return (
    <div className="approval-page">
      <div className="approval-page__header">
        <div>
          <h1>Approval List</h1>

          <p>
            Review and process SAP Master Data requests
            according to the approval workflow.
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

      <div className="approval-summary">
        <div className="approval-summary__card">
          <span>Total Pending</span>
          <strong>{submissions.length}</strong>
        </div>

        <div className="approval-summary__card">
          <span>Accounting</span>
          <strong>
            {
              submissions.filter(
                (item) =>
                  item.status === "REVIEW_ACCOUNTING",
              ).length
            }
          </strong>
        </div>

        <div className="approval-summary__card">
          <span>Tax</span>
          <strong>
            {
              submissions.filter(
                (item) => item.status === "REVIEW_TAX",
              ).length
            }
          </strong>
        </div>

        <div className="approval-summary__card">
          <span>PIC</span>
          <strong>
            {
              submissions.filter(
                (item) => item.status === "WAITING_PIC",
              ).length
            }
          </strong>
        </div>
      </div>

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
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value)
              }
            >
              <option value="ALL">
                All Status
              </option>

              <option value="SUBMITTED">
                Waiting Division Head
              </option>

              <option value="REVIEW_ACCOUNTING">
                Review Accounting
              </option>

              <option value="REVIEW_TAX">
                Review Tax
              </option>

              <option value="WAITING_PIC">
                Waiting PIC
              </option>
            </select>
          </div>
        </div>

        {error && (
          <div className="approval-alert approval-alert--error">
            {error}
          </div>
        )}

        {loading && (
          <div className="approval-empty">
            <strong>Loading approval list...</strong>
          </div>
        )}

        {!loading &&
          !error &&
          filteredSubmissions.length === 0 && (
            <div className="approval-empty">
              <div className="approval-empty__icon">
                ✓
              </div>

              <h3>No pending approval</h3>

              <p>
                Tidak ada submission yang sedang menunggu
                proses approval.
              </p>
            </div>
          )}

        {!loading &&
          filteredSubmissions.length > 0 && (
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
                  {filteredSubmissions.map(
                    (submission) => {
                      const status = getStatus(
                        submission.status,
                      );

                      return (
                        <tr key={submission.id}>
                          <td>
                            <strong>
                              {submission.number}
                            </strong>

                            <span className="approval-table__type">
                              {submission.type}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {submission.requestor?.name ||
                                "-"}
                            </strong>

                            <span className="approval-table__muted">
                              {submission.requestor?.email ||
                                "-"}
                            </span>
                          </td>

                          <td>
                            <strong>
                              {submission.form_type}
                            </strong>

                            <span className="approval-table__muted">
                              {submission.sub_category ||
                                "-"}
                            </span>
                          </td>

                          <td>
                            {submission.category || "-"}
                          </td>

                          <td>
                            <span
                              className={`approval-status ${status.className}`}
                            >
                              {status.label}
                            </span>
                          </td>

                          <td>
                            {formatDate(
                              submission.submitted_at ||
                                submission.created_at,
                            )}
                          </td>

                          <td>
                            <button
                              type="button"
                              className="approval-table__view"
                              onClick={() =>
                                openDetail(submission)
                              }
                            >
                              Review →
                            </button>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>
          )}
      </div>

      {selected && (
        <div
          className="approval-modal"
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget &&
              !processing
            ) {
              closeDetail();
            }
          }}
        >
          <div className="approval-modal__content">
            <header className="approval-modal__header">
              <div>
                <span className="approval-modal__eyebrow">
                  {selected.type} ·{" "}
                  {selected.category || "-"}
                </span>

                <h2>{selected.number}</h2>

                <p>{selected.form_type}</p>
              </div>

              <button
                type="button"
                className="approval-modal__close"
                onClick={closeDetail}
                disabled={processing}
              >
                ×
              </button>
            </header>

            {detailLoading ? (
              <div className="approval-empty">
                Loading detail...
              </div>
            ) : (
              <div className="approval-modal__body">
                <div className="approval-current-status">
                  <span>Current Status</span>

                  <strong
                    className={`approval-status ${
                      getStatus(selected.status)
                        .className
                    }`}
                  >
                    {getStatus(selected.status).label}
                  </strong>
                </div>

                {actionError && (
                  <div className="approval-alert approval-alert--error">
                    {actionError}
                  </div>
                )}

                <Section title="Requestor">
                  <div className="approval-detail__grid">
                    <DetailField
                      label="Name"
                      value={
                        selected.requestor?.name
                      }
                    />

                    <DetailField
                      label="Email"
                      value={
                        selected.requestor?.email
                      }
                    />

                    <DetailField
                      label="Request Type"
                      value={
                        selected.form_data
                          ?.requestType
                      }
                    />

                    <DetailField
                      label="Customer Code"
                      value={
                        selected.form_data
                          ?.customerCode
                      }
                    />
                  </div>
                </Section>

                <Section title="Customer Request">
                  <div className="approval-detail__grid">
                    <DetailField
                      label="Customer Name"
                      value={
                        selected.form_data
                          ?.customerName
                      }
                    />

                    <DetailField
                      label="Title"
                      value={
                        selected.form_data?.title
                      }
                    />

                    <DetailField
                      label="Invoice Street"
                      value={
                        selected.form_data
                          ?.invoiceStreet
                      }
                    />

                    <DetailField
                      label="Tax Street"
                      value={
                        selected.form_data?.taxStreet
                      }
                    />

                    <DetailField
                      label="City"
                      value={
                        selected.form_data?.city
                      }
                    />

                    <DetailField
                      label="Postal Code"
                      value={
                        selected.form_data
                          ?.postalCode
                      }
                    />

                    <DetailField
                      label="Country"
                      value={
                        selected.form_data?.country
                      }
                    />

                    <DetailField
                      label="Telephone"
                      value={
                        selected.form_data?.telephone
                      }
                    />

                    <DetailField
                      label="NPWP"
                      value={
                        selected.form_data?.npwp
                      }
                    />

                    <DetailField
                      label="Customer Class"
                      value={
                        selected.form_data
                          ?.customerClass
                      }
                    />

                    <DetailField
                      label="Company Code"
                      value={
                        selected.form_data
                          ?.companyCode
                      }
                    />

                    <DetailField
                      label="Sales Organization"
                      value={
                        selected.form_data
                          ?.salesOrganization
                      }
                    />
                  </div>
                </Section>

                {selected.status ===
                  "REVIEW_ACCOUNTING" && (
                  <Section title="Accounting Data">
                    <div className="approval-form-grid">
                      <div className="approval-form-field approval-form-field--full">
                        <label>
                          Account Group
                        </label>

                        <select
                          value={
                            accounting.accountGroup
                          }
                          onChange={(e) =>
                            updateAccounting(
                              "accountGroup",
                              e.target.value,
                            )
                          }
                          disabled={processing}
                        >
                          <option value="">
                            Select Account Group
                          </option>

                          {ACCOUNT_GROUPS.map(
                            ([code, name]) => (
                              <option
                                key={code}
                                value={code}
                              >
                                {code} - {name}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div className="approval-form-field">
                        <label>
                          Recon Account
                        </label>

                        <input
                          type="text"
                          value={
                            accounting.recontAccount
                          }
                          onChange={(e) =>
                            updateAccounting(
                              "recontAccount",
                              e.target.value,
                            )
                          }
                          placeholder="Recon account"
                          disabled={processing}
                        />
                      </div>

                      <div className="approval-form-field">
                        <label>Sort Key</label>

                        <select
                          value={
                            accounting.sortKey
                          }
                          onChange={(e) =>
                            updateAccounting(
                              "sortKey",
                              e.target.value,
                            )
                          }
                          disabled={processing}
                        >
                          <option value="">
                            Select Sort Key
                          </option>

                          {SORT_KEYS.map(
                            ([code, name]) => (
                              <option
                                key={code}
                                value={code}
                              >
                                {code} - {name}
                              </option>
                            ),
                          )}
                        </select>
                      </div>

                      <div className="approval-form-field approval-form-field--full">
                        <label>
                          Tolerance Group
                        </label>

                        <select
                          value={
                            accounting.toleranceGroup
                          }
                          onChange={(e) =>
                            updateAccounting(
                              "toleranceGroup",
                              e.target.value,
                            )
                          }
                          disabled={processing}
                        >
                          <option value="">
                            Select Tolerance Group
                          </option>

                          {TOLERANCE_GROUPS.map(
                            ([code, name]) => (
                              <option
                                key={code}
                                value={code}
                              >
                                {code} - {name}
                              </option>
                            ),
                          )}
                        </select>
                      </div>
                    </div>
                  </Section>
                )}

                {selected.status ===
                  "REVIEW_TAX" && (
                  <Section title="Tax Data">
                    <div className="approval-checkbox-grid">
                      {WITHOLDING_TAX.map(
                        ([code, name]) => (
                          <label
                            key={code}
                            className="approval-checkbox"
                          >
                            <input
                              type="checkbox"
                              checked={tax.witholdingTax.includes(
                                code,
                              )}
                              onChange={() =>
                                toggleTax(code)
                              }
                              disabled={processing}
                            />

                            <span>
                              <strong>
                                {code}
                              </strong>

                              {name}
                            </span>
                          </label>
                        ),
                      )}
                    </div>
                  </Section>
                )}

                {selected.status === "WAITING_PIC" && (
                  <Section title="PIC Processing">
                    <div className="approval-form-field">
                      <label>
                        Customer Code
                        {selected.form_data
                          ?.requestType ===
                          "New" && (
                          <span className="approval-required">
                            {" "}
                            *
                          </span>
                        )}
                      </label>

                      <input
                        type="text"
                        value={customerCode}
                        onChange={(e) =>
                          setCustomerCode(
                            e.target.value,
                          )
                        }
                        placeholder="Input customer code"
                        disabled={processing}
                      />

                      {selected.form_data
                        ?.requestType ===
                        "New" && (
                        <small>
                          Customer code wajib diisi
                          untuk request New.
                        </small>
                      )}
                    </div>
                  </Section>
                )}

                <Section title="Approval History">
                  {selected.approval_history?.length ? (
                    <div className="approval-history">
                      {selected.approval_history.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="approval-history__item"
                          >
                            <div className="approval-history__marker">
                              ✓
                            </div>

                            <div className="approval-history__content">
                              <div className="approval-history__top">
                                <strong>
                                  {item.step}
                                </strong>

                                <span>
                                  {formatDate(
                                    item.created_at,
                                  )}
                                </span>
                              </div>

                              <p>
                                {item.action}
                              </p>

                              <small>
                                By:{" "}
                                {item.actor?.name ||
                                  "-"}
                              </small>

                              {item.notes && (
                                <div className="approval-history__notes">
                                  {item.notes}
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className="approval-muted">
                      Belum ada approval history.
                    </p>
                  )}
                </Section>

                {selected.attachments?.length > 0 && (
                  <Section title="Attachments">
                    <div className="approval-attachments">
                      {selected.attachments.map(
                        (attachment, index) => (
                          <div
                            key={`${attachment.name}-${index}`}
                            className="approval-attachment"
                          >
                            <span>📎</span>

                            <div>
                              <strong>
                                {attachment.name}
                              </strong>

                              <small>
                                {attachment.type ||
                                  "File"}
                              </small>
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </Section>
                )}

                {renderActionPanel()}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}