import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { submissionApi } from "../../api/submission";

export default function MySubmissionPage() {
  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState([]);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const loadSubmissions = async () => {
    try {
      setError("");

      const response = await submissionApi.getAll();

      setSubmissions(response.data?.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message || "Gagal mengambil data submission.",
      );
    } finally {

    }
  };

  useEffect(() => {
    loadSubmissions();
  }, []);

  /*
   * =========================================================
   * SUMMARY
   * =========================================================
   */

  const totalSubmission = submissions.length;

  const totalDraft = submissions.filter(
    (item) => item.status === "DRAFT",
  ).length;

  const totalSubmitted = submissions.filter(
    (item) => item.status === "SUBMITTED",
  ).length;

  /*
   * =========================================================
   * FILTER
   * =========================================================
   */

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

  /*
   * =========================================================
   * ACTION
   * =========================================================
   */

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

    navigate(`/create-ticket/sap-masterdata/customer-form?submission=${submission.id}`);
  };

  /*
   * =========================================================
   * DATE
   * =========================================================
   */

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDateTime = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /*
   * =========================================================
   * STATUS
   * =========================================================
   */

  const getStatusConfig = (status) => {
    switch (status) {
      case "DRAFT":
        return {
          label: "Draft",
          className: "my-submission__status--draft",
          icon: "✎",
        };

      case "SUBMITTED":
        return {
          label: "Submitted",
          className: "my-submission__status--submitted",
          icon: "✓",
        };

      default:
        return {
          label: status,
          className: "",
          icon: "•",
        };
    }
  };

  return (
    <div className="my-submission">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="my-submission__header">
        <div>
          <h1 className="my-submission__title">My Submission</h1>

          <p className="my-submission__description">
            View and manage all requests that you have created.
          </p>
        </div>
      </div>

      {/* =====================================================
          SUMMARY
      ===================================================== */}

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

      {/* =====================================================
          MAIN CARD
      ===================================================== */}

      <div className="my-submission__card">
        {/* ===================================================
            TOOLBAR
        =================================================== */}

        <div className="my-submission__toolbar">
          <div>
            <h2>Submission List</h2>

            <p>
              {filteredSubmissions.length} request
              {filteredSubmissions.length !== 1 ? "s" : ""} found
            </p>
          </div>

          <div className="my-submission__filters">
            {/* Search */}

            <div className="my-submission__search">
              <span>⌕</span>

              <input
                type="text"
                placeholder="Search number or form..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  ×
                </button>
              )}
            </div>

            {/* Type */}

            <select
              className="my-submission__select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Type</option>

              <option value="SAP">SAP</option>

              <option value="IT">IT</option>
            </select>

            {/* Status */}

            <select
              className="my-submission__select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>

              <option value="DRAFT">Draft</option>

              <option value="SUBMITTED">Submitted</option>
            </select>
          </div>
        </div>

        {/* ===================================================
            ERROR
        =================================================== */}

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

        {/* ===================================================
            EMPTY
        =================================================== */}

        {!error && filteredSubmissions.length === 0 && (
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

        {/* ===================================================
            TABLE
        =================================================== */}

        {!error && filteredSubmissions.length > 0 && (
          <div className="my-submission__table-wrapper">
            <table className="my-submission__table">
              <thead>
                <tr>
                  <th>Number</th>
                  <th>Request</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Updated</th>
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
                      {/* Number */}

                      <td>
                        <div className="my-submission__number">
                          <strong>{submission.number}</strong>

                          <span>{submission.type}</span>
                        </div>
                      </td>

                      {/* Request */}

                      <td>
                        <div className="my-submission__request">
                          <strong>{submission.form_type}</strong>

                          <span>{submission.sub_category || "-"}</span>
                        </div>
                      </td>

                      {/* Category */}

                      <td>
                        <span className="my-submission__category">
                          {submission.category || "-"}
                        </span>
                      </td>

                      {/* Status */}

                      <td>
                        <span
                          className={`my-submission__status ${status.className}`}
                        >
                          <span>{status.icon}</span>

                          {status.label}
                        </span>
                      </td>

                      {/* Created */}

                      <td>
                        <div className="my-submission__date">
                          <strong>{formatDate(submission.created_at)}</strong>

                          <span>
                            {formatDateTime(submission.created_at).split(
                              ", ",
                            )[1] || ""}
                          </span>
                        </div>
                      </td>

                      {/* Updated */}

                      <td>
                        <div className="my-submission__date">
                          <strong>{formatDate(submission.updated_at)}</strong>

                          <span>
                            {formatDateTime(submission.updated_at).split(
                              ", ",
                            )[1] || ""}
                          </span>
                        </div>
                      </td>

                      {/* Action */}

                      <td>
                        <button
                          type="button"
                          className="my-submission__action"
                          onClick={(e) => {
                            e.stopPropagation();

                            handleOpen(submission);
                          }}
                        >
                          {submission.status === "DRAFT" ? "Edit" : "View"}

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
