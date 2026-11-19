import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { showNotification } from "../../../utils/notification";

import { submissionApi } from "../../../api/submission";

import FormRenderer from "../../../components/FormRenderer";

import { validateAttachments } from "../../../components/AttachmentField";
import { appendAttachments } from "../../../utils/attachment";
import { ArrowLeft } from "lucide-react";

export default function WbsFormPage() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const submissionId = searchParams.get("submission");

  const [loading, setLoading] = useState(Boolean(submissionId));

  const [readOnly, setReadOnly] = useState(false);

  const [formData, setFormData] = useState({});

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

        if (!submission) {
          throw new Error("Request not found.");
        }

        if (
          submission.type !== "SAP" ||
          submission.category !== "Master Data" ||
          submission.sub_category !== "WBS"
        ) {
          navigate("/submission");
          return;
        }

        setAttachments(submission.attachments || []);

        const editableStatuses = ["DRAFT"];

        setReadOnly(!editableStatuses.includes(submission.status));

        setFormData({
          ...(submission.form_data || {}),
        });
      } catch (error) {
        console.error(error);

        showNotification({
          icon: "error",
          title: "Failed",
          text: error.response?.data?.message || "Failed to load Request.",
        });

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

    if (mode === "submit" && attachments.length === 0) {
      setFormData((previous) => ({
        ...previous,
        attachmentError: "Please upload an attachment before submitting.",
      }));

      return;
    }

    setSubmitMode(mode);

    try {
      const payload = {
        type: "SAP",
        category: "Master Data",
        sub_category: "WBS",
        form_type: "SAP - Master Data - WBS",
        status: mode === "submit" ? "SUBMITTED" : "DRAFT",
        form_data: {},
      };

      const multipart = new FormData();

      multipart.append("data", JSON.stringify(payload));

      appendAttachments(multipart, attachments);

      let response;

      if (!submissionId) {
        response = await submissionApi.create(multipart);
      } else {
        response = await submissionApi.update(submissionId, multipart);
      }

      const saved = response.data?.data;

      if (saved?.status === "WAITING_PIC") {
        showNotification({
          icon: "success",
          title: submissionId ? "Resubmitted" : "Submitted",
          html: `
            Request successfully ${submissionId ? "resubmitted" : "submitted"}.
            <br>
            <strong>Number: ${saved.number}</strong>
          `,
        });

        navigate("/submission");

        return;
      }

      if (saved?.status === "DRAFT") {
        showNotification({
          icon: "success",
          title: "Saved",
          html: `
            Draft successfully saved.
            <br>
            <strong>Number: ${saved.number}</strong>
          `,
        });

        navigate("/submission");

        return;
      }
    } catch (error) {
      console.error(error);

      showNotification({
        icon: "error",
        title: "Failed",
        text: error.response?.data?.message || "Failed to save Request.",
      });
    } finally {
      setSubmitMode("");
    }
  };

  return (
    <main className="mx-auto w-full max-w-screen-2xl space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <header className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                SAP · Master Data · WBS
              </p>

              <h1 className="mt-1.5 wrap-break-word text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Master Data WBS Request
              </h1>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit("submit")}>
            <FormRenderer
              type="SAP"
              category="Master Data"
              subCategory="WBS"
              formData={formData}
              setFormData={setFormData}
              mode="create"
              readOnly={readOnly}
              attachments={attachments}
              setAttachments={setAttachments}
              existingAttachments={attachments}
            />

            <div className="mt-6 flex flex-row items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                disabled={Boolean(submitMode)}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                {readOnly ? "Back" : "Cancel"}
              </button>

              {!readOnly && (
                <>
                  <button
                    type="button"
                    onClick={handleSubmit("draft")}
                    disabled={Boolean(submitMode)}
                    className="inline-flex items-center justify-center rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800 shadow-2xs transition hover:border-amber-400 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  >
                    {submitMode === "draft" ? "Saving..." : "Save as Draft"}
                  </button>

                  <button
                    type="submit"
                    disabled={Boolean(submitMode)}
                    className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
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
