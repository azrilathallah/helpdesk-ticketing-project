import AttachmentField from "../AttachmentField";

export const DEFAULT_WBS_FORM = {};

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
   WBS FORM
========================================================= */

export default function WbsFormFields({
  formData,
  mode = "submission",
  readOnly = false,
  attachments = [],
  setAttachments,
  existingAttachments = [],
}) {
  const isCreateMode = mode === "create";

  return (
    <div className="space-y-5">
      {/* ATTACHMENT */}
      <Section number={1} title="Attachment">
        <AttachmentField
          files={attachments}
          existingFiles={existingAttachments}
          onChange={setAttachments}
          disabled={!isCreateMode || readOnly}
          error={formData?.attachmentError}
        />
      </Section>
    </div>
  );
}
