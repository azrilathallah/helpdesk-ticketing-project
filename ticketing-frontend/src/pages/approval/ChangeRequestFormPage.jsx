import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showNotification } from "../../utils/notification";
import { approvalApi } from "../../api/approval";
import { getUserValue } from "../../config/UserValue";
import { useAuth } from "../../context/AuthContext";
import {
  DEFAULT_CR_DATA,
  ChangeRequestFormSections,
} from "../../components/sap-masterdata/forms/SapSupportFormFields";

export default function ChangeRequestFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submission, setSubmission] = useState(null);
  const [crData, setCrData] = useState(DEFAULT_CR_DATA);
  const [revisionNotes, setRevisionNotes] = useState([]);

  useEffect(() => {
    if (!id) return;

    const loadSubmission = async () => {
      try {
        setLoading(true);
        const response = await approvalApi.getById(id);
        const data = response.data?.data;

        if (!data) {
          throw new Error("Request not found.");
        }

        setSubmission(data);

        const existingForm = data.form_data || {};
        const existingCr = existingForm.crData || {};
        const currentPicName = getUserValue(user, ["name", "nama"]);
        const defaultPic =
          existingCr.sapFunctional && existingCr.sapFunctional !== "-"
            ? existingCr.sapFunctional
            : currentPicName !== "-"
              ? currentPicName
              : "";

        setCrData({
          ...DEFAULT_CR_DATA,
          ...existingCr,
          requestDate: existingCr.requestDate || "",
          sapFunctional: defaultPic,
        });

        setRevisionNotes(
          (data.approval_history || []).filter(
            (item) =>
              item.action === "REVISION_REQUESTED" && item.notes?.trim(),
          ),
        );
      } catch (err) {
        console.error(err);
        showNotification({
          icon: "error",
          title: "Failed",
          text:
            err.response?.data?.message ||
            err.message ||
            "Failed to load request details.",
        });
        navigate(`/approval/${id}`);
      } finally {
        setLoading(false);
      }
    };

    loadSubmission();
  }, [id, navigate, user?.name]);

  const requestor = useMemo(
    () => ({
      name: getUserValue(submission?.requestor, ["name", "nama"]),
      department: getUserValue(submission?.requestor, ["department"]),
    }),
    [submission],
  );

  const canEdit = useMemo(
    () =>
      ["WAITING_PIC", "REVISION_PIC", "REVISION_REQUESTOR"].includes(
        submission?.status || "",
      ),
    [submission?.status],
  );

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!submission || !canEdit || submitting) return;

    const formElement = event.currentTarget;
    if (!formElement.reportValidity()) {
      return;
    }

    try {
      setSubmitting(true);
      const response = await approvalApi.submitCr(submission.id, crData);

      showNotification({
        icon: "success",
        title: "Change Request Submitted",
        text:
          response?.data?.message ||
          "Change Request Form was successfully submitted and is awaiting Requestor approval.",
      });

      navigate("/approval");
    } catch (err) {
      console.error(err);
      showNotification({
        icon: "error",
        title: "Failed",
        text:
          err.response?.data?.message ||
          "Failed to submit Change Request Form.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full space-y-5">
        <div className="flex min-h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="text-center">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
            <p className="text-sm text-slate-500">
              Loading Change Request Form...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!submission) return null;

  return (
    <main className="mx-auto w-full space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <header className="border-b border-slate-200 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => navigate(`/approval/${submission.id}`)}
            disabled={submitting}
            className="mb-2 inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:opacity-50"
          >
            <span aria-hidden="true">←</span>
            Back
          </button>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                SAP · Support
              </p>

              <h1 className="mt-2 wrap-break-word text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Change Request Form
              </h1>

              <p className="mt-2 text-sm font-semibold text-slate-800">
                Request Number: {submission.number || "-"}
              </p>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          {revisionNotes.length > 0 && (
            <section className="mb-4 rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 sm:px-4">
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

          <form onSubmit={handleSubmit} className="space-y-5">
            <ChangeRequestFormSections
              crData={crData}
              onChangeCrData={setCrData}
              requestor={requestor}
              disabled={!canEdit || submitting}
              startSectionNumber={1}
            />

            <div className="mt-6 flex flex-row items-center justify-end gap-1.5 border-t border-slate-200 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/approval/${submission.id}`)}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              {canEdit && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

