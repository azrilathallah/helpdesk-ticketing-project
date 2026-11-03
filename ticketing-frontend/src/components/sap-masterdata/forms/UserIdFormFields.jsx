import { Trash2 } from "lucide-react";
import ChoiceGroup from "../ChoiceGroup";
import AttachmentField from "../AttachmentField";
import { Field, ReadOnlyField } from "../FormField";

export const DEFAULT_USERID_FORM = {
  companyCode: "1200",
  phone: "",
  requestType: "New",
  userIdCode: "",
  purposeOfUse: "",

  accessSapServer: "",
  priority: "",
  funtionModule: "",

  notes: [
    {
      request: "",
      activityRole: "",
      otherUsers: "",
      validFrom: "",
      validTo: "",
    },
  ],
};

/* =========================================================
   STYLE HELPERS
========================================================= */

const inputClass =
  "w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500";

const labelClass = "mb-1 block text-xs font-semibold text-slate-700";

const requiredClass = "text-red-600";

function isEditable({ mode, readOnly, approvalRole, field }) {
  if (readOnly) return false;
  if (mode === "create") return true;
  if (mode === "submission") return false;
  if (mode !== "approval") return false;

  if (approvalRole === "pic") {
    return field === "userIdCode";
  }

  return false;
}

/* =========================================================
   SHARED PRESENTATIONAL COMPONENTS
========================================================= */

export function Section({ number, title, children }) {
  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-3 py-3 sm:px-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">
          {number}
        </span>

        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
      </div>

      <div className="flex flex-col gap-3 p-3 sm:p-4">{children}</div>
    </section>
  );
}

/* =========================================================
   NOTES TABLE
========================================================= */

const EMPTY_NOTES = {
  request: "",
  activityRole: "",
  otherUsers: "",
  validFrom: "",
  validTo: "",
};

export function NotesTable({
  label,
  value = [],
  onChange,
  disabled = false,
  required = false,
}) {
  const rows =
    Array.isArray(value) && value.length > 0 ? value : [{ ...EMPTY_NOTES }];

  const updateRow = (index, field, newValue) => {
    const updatedRows = rows.map((row, rowIndex) =>
      rowIndex === index ? { ...row, [field]: newValue } : row,
    );

    onChange?.(updatedRows);
  };

  const addRow = () => {
    onChange?.([...rows, { ...EMPTY_NOTES }]);
  };

  const removeRow = (index) => {
    if (rows.length <= 1) return;

    onChange?.(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <div className="w-full min-w-0 sm:col-span-2">
      <div className="mb-2.5 flex flex-wrap items-center justify-between">
        <label className={labelClass}>
          {label}
          {required && <span className={requiredClass}>*</span>}
        </label>

        {!disabled && (
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-2 py-1.5 text-xs font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            <span className="text-xs leading-none">+</span>
            Add Notes
          </button>
        )}
      </div>

      <div className="w-full overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-200 border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs tracking-wide text-slate-600">
            <tr>
              <th className="w-12 border-b border-slate-200 px-3 py-3 text-center">
                No.
              </th>
              <th className="border-b border-slate-200 px-3 py-3">
                Request
                <p className="text-[10px] text-slate-400">(Filled by User)</p>
              </th>
              <th className="border-b border-slate-200 px-3 py-3">
                Activity & Role to Add
                <p className="text-[10px] text-slate-400">
                  (Filled by Basis/Funtional)
                </p>
              </th>
              <th className="border-b border-slate-200 px-3 py-3">
                Other users with this role
              </th>
              <th className="border-b border-slate-200 px-3 py-3">
                Valid From/To
              </th>
              {!disabled && (
                <th className="w-14 border-b border-slate-200 px-2 py-3" />
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.map((row, index) => (
              <tr key={index} className="bg-white hover:bg-slate-50">
                <td className="px-3 py-3 text-center text-slate-500">
                  {index + 1}
                </td>

                <td className="px-2 py-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={row.request || ""}
                    onChange={(event) =>
                      updateRow(index, "request", event.target.value)
                    }
                    required={required && !disabled}
                    disabled={disabled}
                    aria-label={`request ${index + 1}`}
                  />
                </td>

                <td className="px-2 py-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={row.activityRole || ""}
                    onChange={(event) =>
                      updateRow(index, "activityRole", event.target.value)
                    }
                    required={required && !disabled}
                    disabled={disabled}
                    aria-label={`Activity & Role to Add ${index + 1}`}
                  />
                </td>

                <td className="px-2 py-2">
                  <input
                    type="text"
                    className={inputClass}
                    value={row.otherUsers || ""}
                    onChange={(event) =>
                      updateRow(index, "otherUsers", event.target.value)
                    }
                    required={required && !disabled}
                    disabled={disabled}
                    aria-label={`Other users with this role ${index + 1}`}
                  />
                </td>

                <td className="min-w-44 px-2 py-2">
                  <div className="flex flex-col gap-2">
                    {/* Valid From */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`valid-from-${index}`}
                        className="w-10 shrink-0 text-xs font-medium text-slate-600"
                      >
                        From :
                      </label>

                      <input
                        id={`valid-from-${index}`}
                        type="date"
                        className={inputClass}
                        value={row.validFrom || ""}
                        onChange={(event) =>
                          updateRow(index, "validFrom", event.target.value)
                        }
                        required={required && !disabled}
                        disabled={disabled}
                        aria-label={`Valid From ${index + 1}`}
                        max={row.validTo || undefined}
                      />
                    </div>

                    {/* Valid To */}
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor={`valid-to-${index}`}
                        className="w-10 shrink-0 text-xs font-medium text-slate-600"
                      >
                        To :
                      </label>

                      <input
                        id={`valid-to-${index}`}
                        type="date"
                        className={inputClass}
                        value={row.validTo || ""}
                        onChange={(event) =>
                          updateRow(index, "validTo", event.target.value)
                        }
                        required={required && !disabled}
                        disabled={disabled}
                        aria-label={`Valid To ${index + 1}`}
                        min={row.validFrom || undefined}
                      />
                    </div>
                  </div>
                </td>

                {!disabled && (
                  <td className="px-2 py-2 text-center">
                    <button
                      type="button"
                      onClick={() => removeRow(index)}
                      disabled={rows.length === 1}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-30"
                      title={rows.length === 1 ? "At least one note" : "Delete"}
                      aria-label={`Delete ${index + 1}`}
                    >
                      <Trash2 size={17} strokeWidth={2} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================
   USER ID FORM
========================================================= */

export default function UserIdFormFields({
  formData,
  setFormData,
  mode = "submission",
  readOnly = false,
  approvalRole = null,
  requestor = {},
  attachments = [],
  setAttachments,
  existingAttachments = [],
  onUserIdCodeChange,
}) {
  const form = {
    ...DEFAULT_USERID_FORM,
    ...(formData || {}),
  };

  const update = (name, value) => {
    setFormData?.((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const editable = (field) =>
    isEditable({ mode, readOnly, approvalRole, field });

  const isCreateMode = mode === "create";
  const isApprovalMode = mode === "approval";
  const isPIC = isApprovalMode && approvalRole === "pic";
  const isNewRequest = form.requestType === "New";

  let sectionNumber = 0;
  const nextSection = () => {
    sectionNumber += 1;
    return sectionNumber;
  };

  return (
    <div className="space-y-5">
      {/* REQUESTER INFORMATION */}
      <Section number={nextSection()} title="Requester Information">
        <ChoiceGroup
          label="Company Code"
          groupKey="user-id_company_code"
          value={form.companyCode}
          onChange={(value) => update("companyCode", value)}
          required={isCreateMode}
          disabled={!editable("companyCode")}
        />

        <div className="grid grid-cols-2 items-center gap-2">
          <ReadOnlyField label="Name" value={requestor.name} />
          <ReadOnlyField label="NIK" value={requestor.nik} />
          <ReadOnlyField label="Position" value={requestor.position} />
          <ReadOnlyField label="Department" value={requestor.department} />
          <ReadOnlyField label="Email" value={requestor.email} />
          <Field label="Phone">
            <input
              type="text"
              className={inputClass}
              value={form.phone || ""}
              onChange={(event) => update("phone", event.target.value)}
              disabled={!editable("phone")}
            />
          </Field>
        </div>

        <ChoiceGroup
          label="Request Type"
          groupKey="user-id_request_type"
          value={form.requestType}
          onChange={(value) => update("requestType", value)}
          required={isCreateMode}
          disabled={!editable("requestType")}
        />

        {isNewRequest && !isPIC ? (
          <ReadOnlyField label="User ID Code" value={form.userIdCode || "-"} />
        ) : (
          <Field label="User ID Code" required={isPIC || isCreateMode}>
            <input
              type="text"
              className={inputClass}
              value={form.userIdCode || ""}
              onChange={(event) => {
                const value = event.target.value;
                update("userIdCode", value);
                onUserIdCodeChange?.(value);
              }}
              required={isPIC || isCreateMode}
              disabled={!editable("userIdCode")}
            />
          </Field>
        )}

        <Field label="Purpose of Use" required={isCreateMode}>
          <input
            type="text"
            className={inputClass}
            value={form.purposeOfUse || ""}
            onChange={(event) => update("purposeOfUse", event.target.value)}
            required={isCreateMode}
            disabled={!editable("purposeOfUse")}
          />
        </Field>
      </Section>

      {/* SAP USER INFORMATION */}
      <Section number={nextSection()} title="SAP User Information">
        <ChoiceGroup
          label="Access to SAP Server"
          groupKey="user-id_access_sap_server"
          value={form.accessSapServer}
          onChange={(value) => update("accessSapServer", value)}
          required={isCreateMode}
          disabled={!editable("accessSapServer")}
        />

        <ChoiceGroup
          label="Priority"
          groupKey="user-id_priority"
          value={form.priority}
          onChange={(value) => update("priority", value)}
          required={isCreateMode}
          disabled={!editable("priority")}
        />

        <ChoiceGroup
          label="Function Module"
          groupKey="user-id_funtion_module"
          value={form.funtionModule}
          onChange={(value) => update("funtionModule", value)}
          required={isCreateMode}
          disabled={!editable("funtionModule")}
        />
      </Section>

      {/* NOTES */}
      <Section number={nextSection()} title="Notes">
        <NotesTable
          label="Notes"
          value={form.notes}
          onChange={(value) => update("notes", value)}
          required={isCreateMode}
          disabled={!editable("notes")}
        />
      </Section>

      {/* ATTACHMENT */}
      <Section number={nextSection()} title="Attachment">
        <AttachmentField
          files={attachments}
          existingFiles={existingAttachments}
          onChange={setAttachments}
          disabled={!isCreateMode || readOnly}
          error={form.attachmentError}
        />
      </Section>
    </div>
  );
}
