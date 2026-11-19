import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { showNotification } from "../../../utils/notification";

import { approvalApi } from "../../../api/approval";
import { getUserValue } from "../../../config/UserValue";
import { useAuth } from "../../../context/AuthContext";

import {
  DEFAULT_CR_DATA,
  ChangeRequestFormSections,
} from "../../../components/sap/SapSupportFormFields";
import { ArrowLeft, Hash } from "lucide-react";

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
      Boolean(submission?.can_act) &&
      ["WAITING_PIC", "REVISION_PIC", "REVISION_REQUESTOR"].includes(
        submission?.status || "",
      ),
    [submission?.can_act, submission?.status],
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
    <main className="mx-auto w-full max-w-screen-2xl space-y-5">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <header className="border-b border-slate-100 bg-slate-50/50 p-4 sm:p-6">
          <button
            type="button"
            onClick={() => navigate(`/approval/${submission.id}`)}
            disabled={submitting}
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 shadow-2xs transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </button>

          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600">
                SAP · Support
              </p>

              <h1 className="mt-1.5 wrap-break-word text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                Change Request Form
              </h1>

              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200/80">
                  <Hash className="h-3.5 w-3.5 text-slate-400" />
                  Request Number:{" "}
                  <strong className="font-bold text-slate-900">
                    {submission.number || "-"}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        </header>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit}>
            <ChangeRequestFormSections
              crData={crData}
              onChangeCrData={setCrData}
              requestor={requestor}
              disabled={!canEdit || submitting}
              startSectionNumber={1}
            />

            <div className="mt-6 flex flex-row items-center justify-end gap-2 border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => navigate(`/approval/${submission.id}`)}
                disabled={submitting}
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
              >
                Cancel
              </button>

              {canEdit && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
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
