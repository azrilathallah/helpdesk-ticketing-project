import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../../context/AuthContext";
import { submissionApi } from "../../../api/submission";

import FormRenderer from "../../../components/forms_sap/FormRenderer";

import {
  DEFAULT_CUSTOMER_FORM,
  getUserValue,
  validateAttachments,
} from "../../../components/forms_sap/customer/CustomerFormFields";

export default function CustomerFormPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [searchParams] = useSearchParams();

  const submissionId = searchParams.get("submission");

  const [loading, setLoading] = useState(Boolean(submissionId));

  const [readOnly, setReadOnly] = useState(false);

  const [formData, setFormData] = useState(DEFAULT_CUSTOMER_FORM);

  const [attachments, setAttachments] = useState([]);

  const [submitMode, setSubmitMode] = useState("");

  const requestor = useMemo(
    () => ({
      name: getUserValue(user, ["name", "nama"]),
      position: getUserValue(user, ["position"]),
      division: getUserValue(user, ["division"]),
      department: getUserValue(user, ["department"]),
      telephone: getUserValue(user, ["telephone"]),
      email: getUserValue(user, ["email"]),
    }),
    [user],
  );

  useEffect(() => {
    if (!submissionId) {
      return;
    }

    const loadSubmission = async () => {
      try {
        setLoading(true);

        const response = await submissionApi.getById(submissionId);

        const submission = response.data?.data;

        if (!submission) {
          throw new Error("Submission tidak ditemukan.");
        }

        if (
          submission.type !== "SAP" ||
          submission.category !== "Master Data" ||
          submission.sub_category !== "Customer"
        ) {
          navigate("/submission");
          return;
        }

        if (submission.status !== "DRAFT") {
          setReadOnly(true);
        }

        setFormData({
          ...DEFAULT_CUSTOMER_FORM,
          ...(submission.form_data || {}),
        });
      } catch (error) {
        console.error(error);

        alert(error.response?.data?.message || "Gagal mengambil submission.");

        navigate("/submission");
      } finally {
        setLoading(false);
      }
    };

    loadSubmission();
  }, [submissionId, navigate]);

  const handleSubmit = (mode) => async (event) => {
    event.preventDefault();

    if (readOnly) {
      return;
    }

    const attachmentError = validateAttachments(attachments);

    if (attachmentError) {
      setFormData((previous) => ({
        ...previous,
        attachmentError,
      }));

      return;
    }

    if (mode === "submit") {
      const formElement = event.currentTarget;

      if (!formElement.reportValidity()) {
        return;
      }

      if (!formData.requestType) {
        return;
      }

      if (formData.requestType !== "New" && !formData.customerCode) {
        return;
      }
    }

    setSubmitMode(mode);

    try {
      const payload = {
        type: "SAP",
        category: "Master Data",
        sub_category: "Customer",
        form_type: "SAP Master Data - Customer",
        status: mode === "submit" ? "SUBMITTED" : "DRAFT",
        form_data: {
          ...formData,
        },
      };

      const multipart = new FormData();

      multipart.append("data", JSON.stringify(payload));

      attachments.forEach((file) => {
        multipart.append("attachments[]", file);
      });

      let response;

      if (!submissionId) {
        response = await submissionApi.create(multipart);
      } else {
        response = await submissionApi.update(submissionId, multipart);
      }

      const saved = response.data?.data;

      if (saved?.status === "REVIEW_DIV_HEAD") {
        alert(`Form berhasil disubmit.\n\nNumber: ${saved.number}`);

        navigate("/submission");

        return;
      }

      if (saved?.status === "DRAFT") {
        alert(`Draft berhasil disimpan.\n\nNumber: ${saved.number}`);

        navigate("/submission");

        return;
      }
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Gagal menyimpan submission.");
    } finally {
      setSubmitMode("");
    }
  };

  if (loading) {
    return (
      <div className="customer-form-page">
        <div className="customer-form-card">
          <div className="approval-empty">
            <strong>Loading form...</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-form-page">
      <div className="customer-form-card">
        {/* HEADER */}

        <header className="customer-form__header">
          <button
            type="button"
            className="customer-form__back"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="customer-form__header-content">
            <div>
              <p className="customer-form__eyebrow">
                SAP · Master Data · Customer
              </p>

              <h1>Master Data Customer Request</h1>
            </div>
          </div>
        </header>

        <form
          className="customer-form"
          onSubmit={(event) => event.preventDefault()}
        >
          <FormRenderer
            type="SAP"
            category="Master Data"
            subCategory="Customer"
            formData={formData}
            setFormData={setFormData}
            mode="create"
            readOnly={readOnly}
            requestor={requestor}
            attachments={attachments}
            setAttachments={setAttachments}
          />

          {/* ACTIONS */}

          <div className="customer-form__actions">
            <button
              type="button"
              className="customer-form__button customer-form__button--secondary"
              onClick={() => navigate(-1)}
            >
              {readOnly ? "Back" : "Cancel"}
            </button>

            {!readOnly && (
              <>
                <button
                  type="button"
                  className="customer-form__button customer-form__button--draft"
                  onClick={handleSubmit("draft")}
                  disabled={Boolean(submitMode)}
                >
                  {submitMode === "draft" ? "Saving..." : "Save as Draft"}
                </button>

                <button
                  type="button"
                  className="customer-form__button customer-form__button--primary"
                  onClick={handleSubmit("submit")}
                  disabled={Boolean(submitMode)}
                >
                  {submitMode === "submit" ? "Submitting..." : "Submit"}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
