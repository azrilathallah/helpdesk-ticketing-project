import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../../../context/AuthContext";
import { submissionApi } from "../../../../api/submission";

import FormRenderer from "../../../../components/forms-sap-masterdata/FormRenderer";

import {
  DEFAULT_CUSTOMER_FORM,
  getUserValue,
  validateAttachments,
} from "../../../../components/forms-sap-masterdata/customer/CustomerFormFields";

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

        const editableStatuses = ["DRAFT", "REVISION_REQUESTOR"];

        setReadOnly(!editableStatuses.includes(submission.status));

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
        form_type: "SAP - Master Data - Customer",
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
        alert(
          `Form berhasil ${
            submissionId ? "diajukan kembali" : "disubmit"
          }.\n\nNumber: ${saved.number}`,
        );

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

  return (
    <main className="mx-auto w-full space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <span aria-hidden="true">←</span>
            Back
          </button>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                SAP · Master Data · Customer
              </p>

              <h1 className="mt-2 wrap-break-word text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Master Data Customer Request
              </h1>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit("submit")}>
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

            <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={Boolean(submitMode)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {readOnly ? "Back" : "Cancel"}
              </button>

              {!readOnly && (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit("draft")}
                    disabled={Boolean(submitMode)}
                    className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-800 shadow-sm transition hover:border-amber-400 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitMode === "draft" ? "Saving..." : "Save as Draft"}
                  </button>

                  <button
                    type="submit"
                    disabled={Boolean(submitMode)}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitMode === "submit" ? "Submitting..." : "Submit"}
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
