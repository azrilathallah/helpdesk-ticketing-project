import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { submissionApi } from "../../../../api/submission";

import FormRenderer from "../../../../components/forms-sap-masterdata/FormRenderer";
import { DEFAULT_VENDOR_FORM } from "../../../../components/forms-sap-masterdata/vendor/VendorFormFields";

import { validateAttachments } from "../../../../components/forms-sap-masterdata/AttachmentField";

export default function VendorFormPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const submissionId = searchParams.get("submission");

  const [loading, setLoading] = useState(Boolean(submissionId));

  const [readOnly, setReadOnly] = useState(false);

  const [formData, setFormData] = useState(DEFAULT_VENDOR_FORM);

  const [revisionNotes, setRevisionNotes] = useState([]);

  const [attachments, setAttachments] = useState([]);

  const [submitMode, setSubmitMode] = useState("");

  useEffect(() => {
    if (!submissionId) {
      return;
    }

    const loadSubmission = async () => {
      try {
        setLoading(true);

        const response = await submissionApi.getById(submissionId);

        const submission = response.data?.data;

        setRevisionNotes(
          (submission?.approval_history || []).filter(
            (item) =>
              item.step === "DIV_HEAD_REVISION" &&
              item.action === "REVISION_REQUESTED" &&
              item.notes?.trim(),
          ),
        );

        if (!submission) {
          throw new Error("Request not found");
        }

        if (
          submission.type !== "SAP" ||
          submission.category !== "Master Data" ||
          submission.sub_category !== "Vendor"
        ) {
          navigate("/submission");
          return;
        }

        const editableStatuses = ["DRAFT", "REVISION_REQUESTOR"];

        setReadOnly(!editableStatuses.includes(submission.status));

        setFormData({
          ...DEFAULT_VENDOR_FORM,
          ...(submission.form_data || {}),
        });
      } catch (error) {
        console.error(error);

        alert(error.response?.data?.message || "Failed to load request");

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

      if (formData.requestType !== "New" && !formData.vendorCode) {
        return;
      }
    }

    setSubmitMode(mode);

    try {
      const payload = {
        type: "SAP",
        category: "Master Data",
        sub_category: "Vendor",
        form_type: "SAP - Master Data - Vendor",
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
          `Request successfully ${
            submissionId ? "resubmitted" : "submitted"
          }.\n\nNumber: ${saved.number}`,
        );

        navigate("/submission");

        return;
      }

      if (saved?.status === "DRAFT") {
        alert(`Draft successfully saved.\n\nNumber: ${saved.number}`);

        navigate("/submission");

        return;
      }
    } catch (error) {
      console.error(error);

      alert(error.response?.data?.message || "Failed to save Request.");
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
                SAP · Master Data · Vendor
              </p>

              <h1 className="mt-2 wrap-break-word text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Master Data Vendor Request
              </h1>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {submissionId && revisionNotes.length > 0 && (
            <section className="mb-4 rounded-lg border border-orange-200 bg-orange-50 py-2 px-3 sm:px-4">
              <h2 className="text-sm font-semibold text-orange-800">
                Revision Notes
              </h2>

              <div className="mt-1 space-y-3">
                {revisionNotes.map((item, index) => (
                  <div key={`${item.id ?? item.step}-${index}`}>
                    <div className="rounded-sm border border-orange-300 bg-white p-2">
                      <p className="whitespace-pre-wrap wrap-break-word text-xs text-slate-700">
                        {item.notes}
                      </p>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-between gap-1 px-1">
                      {item.actor?.name && (
                        <p className="text-xs text-slate-500">
                          By: {item.actor.name}
                        </p>
                      )}

                      {item.created_at && (
                        <p className="text-xs text-slate-500">
                          {new Date(item.created_at).toLocaleString("id-ID")}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <form onSubmit={handleSubmit("submit")}>
            <FormRenderer
              type="SAP"
              category="Master Data"
              subCategory="Vendor"
              formData={formData}
              setFormData={setFormData}
              mode="create"
              readOnly={readOnly}
              attachments={attachments}
              setAttachments={setAttachments}
            />

            <div className="mt-6 flex gap-1.5 border-t border-slate-200 pt-4 flex-row items-center justify-end">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={Boolean(submitMode)}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {readOnly ? "Back" : "Cancel"}
              </button>

              {!readOnly && (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit("draft")}
                    disabled={Boolean(submitMode)}
                    className="inline-flex items-center justify-center rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800 shadow-sm transition hover:border-amber-400 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {submitMode === "draft" ? "Saving..." : "Save as Draft"}
                  </button>

                  <button
                    type="submit"
                    disabled={Boolean(submitMode)}
                    className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
