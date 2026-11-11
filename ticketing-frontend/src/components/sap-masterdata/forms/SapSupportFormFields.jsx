import ChoiceGroup from "../ChoiceGroup";
import AttachmentField from "../AttachmentField";
import { Field, ReadOnlyField } from "../FormField";

export const DEFAULT_CR_DATA = {
  title: "",
  requestDate: "",
  targetDate: "",
  crNumber: "",
  sapFunctional: "",

  implication: "",
  priority: "",
  currentProcess: "",
  expectedProcess: "",
  benefit: "",
};

export const DEFAULT_SAP_SUPPORT_FORM = {
  module: "",
  description: "",
  solution: "",
  needCrForm: "No",
  hasCrForm: false,
  crData: {
    ...DEFAULT_CR_DATA,
  },
};

/* =========================================================
   STYLE HELPERS
========================================================= */

const inputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

/* =========================================================
   SHARED PRESENTATIONAL COMPONENTS
========================================================= */

export function Section({ number, title, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 p-3 sm:px-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">
          {number}
        </span>

        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      <div className="flex flex-col gap-2 sm:gap-3 p-3 sm:p-4">{children}</div>
    </section>
  );
}

/* =========================================================
   CHANGE REQUEST SECTIONS (REUSABLE IN CR PAGE & DETAIL VIEW)
========================================================= */

export function ChangeRequestFormSections({
  crData = DEFAULT_CR_DATA,
  onChangeCrData,
  requestor = {},
  disabled = false,
  startSectionNumber = 1,
}) {
  const data = {
    ...DEFAULT_CR_DATA,
    ...(crData || {}),
  };

  const updateCr = (field, value) => {
    onChangeCrData?.({
      ...data,
      [field]: value,
    });
  };

  const requestDateDisplay =
    data.requestDate || new Date().toISOString().slice(0, 10);

  return (
    <>
      {/* SECTION 1: HEADER PERMINTAAN CR */}
      <Section number={startSectionNumber} title="Change Request Management Form">
        <Field label="Request Title" required={!disabled}>
          <input
            type="text"
            className={inputClass}
            value={data.title}
            onChange={(event) => updateCr("title", event.target.value)}
            required={!disabled}
            disabled={disabled}
          />
        </Field>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <ReadOnlyField label="Requested by" value={requestor.name} />
          <ReadOnlyField
            label="Department / Unit"
            value={requestor.department}
          />
          <Field label="Request Date">
            <input
              type="date"
              className={inputClass}
              value={requestDateDisplay}
              disabled
            />
          </Field>

          <Field label="Target Date for Request" required={!disabled}>
            <input
              type="date"
              className={inputClass}
              value={data.targetDate}
              min={requestDateDisplay}
              onChange={(event) => updateCr("targetDate", event.target.value)}
              required={!disabled}
              disabled={disabled}
            />
          </Field>

          <Field label="Number Change Request" required={!disabled}>
            <input
              type="text"
              className={inputClass}
              value={data.crNumber}
              onChange={(event) => updateCr("crNumber", event.target.value)}
              required={!disabled}
              disabled={disabled}
            />
          </Field>

          <ReadOnlyField label="SAP Functional" value={data.sapFunctional} />
        </div>

        <ChoiceGroup
          label="Implication"
          groupKey="sap-support_implication"
          value={data.implication}
          onChange={(value) => updateCr("implication", value)}
          required={!disabled}
          disabled={disabled}
        />

        <ChoiceGroup
          label="Priority"
          groupKey="sap-support_priority"
          value={data.priority}
          onChange={(value) => updateCr("priority", value)}
          required={!disabled}
          disabled={disabled}
        />

        <div className="min-w-0">
          <label className="block text-xs font-semibold text-slate-700">
            Penjelasan Bisnis Proses yang sedang berjalan pada saat ini
            {!disabled && <span className="text-red-600">*</span>}
          </label>
          <p className="mb-1 text-[11px] text-slate-500">
            Jelaskan mengenai proses yang berjalan saat ini atau skenario yang
            ingin diubah.
          </p>
          <textarea
            rows={3}
            className={`${inputClass} resize-y`}
            value={data.currentProcess}
            onChange={(event) => updateCr("currentProcess", event.target.value)}
            required={!disabled}
            disabled={disabled}
          />
        </div>

        <div className="min-w-0">
          <label className="block text-xs font-semibold text-slate-700">
            Penjelasan Bisnis Proses yang diharapkan
            {!disabled && <span className="text-red-600">*</span>}
          </label>
          <p className="mb-1 text-[11px] text-slate-500">
            Apa persyaratan bisnis yang kurang, yang perlu dimasukkan sebagai
            bagian dari desain. Persyaratan dapat dikaitkan dengan proses,
            interface, konversi data, report atau form-form.
          </p>
          <textarea
            rows={3}
            className={`${inputClass} resize-y`}
            value={data.expectedProcess}
            onChange={(event) =>
              updateCr("expectedProcess", event.target.value)
            }
            required={!disabled}
            disabled={disabled}
          />
        </div>

        <div className="min-w-0">
          <label className="block text-xs font-semibold text-slate-700">
            Keuntungan/Kelebihan perubahan Bisnis Proses
            {!disabled && <span className="text-red-600">*</span>}
          </label>
          <p className="mb-1 text-[11px] text-slate-500">
            Jelaskan alasan bisnis mengapa hal ini diperlukan.
          </p>
          <textarea
            rows={3}
            className={`${inputClass} resize-y`}
            value={data.benefit}
            onChange={(event) => updateCr("benefit", event.target.value)}
            required={!disabled}
            disabled={disabled}
          />
        </div>
      </Section>
    </>
  );
}

/* =========================================================
   SAP SUPPORT FORM FIELDS (SUBMISSION & APPROVAL VIEW)
========================================================= */

export default function SapSupportFormFields({
  formData,
  setFormData,
  mode = "submission",
  readOnly = false,
  approvalRole = null,
  status = "",
  requestor = {},
  attachments = [],
  setAttachments,
  existingAttachments = [],
  onOpenCrForm,
  processing = false,
}) {
  const form = {
    ...DEFAULT_SAP_SUPPORT_FORM,
    ...(formData || {}),
    crData: {
      ...DEFAULT_CR_DATA,
      ...(formData?.crData || {}),
    },
  };

  const update = (name, value) => {
    setFormData?.((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const isApprovalMode = mode === "approval";
  const isPIC = isApprovalMode && approvalRole === "pic" && !readOnly;
  const isWaitingPic = status === "WAITING_PIC";
  const isRevisionPic = status === "REVISION_PIC";
  const isPostCrPic = status === "APPROVED_IT_SAP_HEAD";
  const isRevisingCr =
    isPIC && (isRevisionPic || (isWaitingPic && Boolean(form.hasCrForm)));
  const canEditSolution =
    isPIC && ((isWaitingPic && !form.hasCrForm) || isPostCrPic);

  let sectionNumber = 0;
  const nextSection = () => {
    sectionNumber += 1;
    return sectionNumber;
  };

  return (
    <div className="space-y-5">
      {/* 1. ISSUE DETAILS */}
      <Section number={nextSection()} title="Issue">
        <Field label="Module">
          <input
            className={inputClass}
            placeholder="Unassigned"
            value={form.module}
            onChange={(value) => update("module", value)}
            disabled
          />
        </Field>

        <Field label="Issue Description">
          <textarea
            rows={4}
            className={`${inputClass} resize-y`}
            value={form.description}
            disabled
            readOnly
          />
        </Field>

        <AttachmentField
          files={attachments}
          existingFiles={existingAttachments}
          onChange={setAttachments}
          disabled
        />
      </Section>

      {/* 2. CHANGE REQUEST FORM (JIKA SUDAH DIISI OLEH PIC) */}
      {form.hasCrForm && (
        <ChangeRequestFormSections
          crData={form.crData}
          onChangeCrData={(nextCrData) => update("crData", nextCrData)}
          requestor={requestor}
          disabled={!isRevisingCr || processing}
          startSectionNumber={nextSection()}
        />
      )}

      {/* 3. SOLUTION SECTION */}
      {(canEditSolution ||
        Boolean(form.solution) ||
        status === "TICKET_SOLVED") && (
        <Section number={nextSection()} title="PIC Resolution">
          <Field
            label="Solution"
            required={canEditSolution}
          >
            <textarea
              rows={3}
              className={`${inputClass} resize-y`}
              value={form.solution}
              onChange={(event) => update("solution", event.target.value)}
              required={canEditSolution}
              disabled={!canEditSolution || processing}
            />
          </Field>

          {isPIC && isWaitingPic && !form.hasCrForm && (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
              <span className="text-xs font-medium text-slate-600">
                Need Change Request Form?
              </span>

              <button
                type="button"
                onClick={() => onOpenCrForm?.()}
                disabled={processing}
                className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Fill Change Request Form
              </button>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
